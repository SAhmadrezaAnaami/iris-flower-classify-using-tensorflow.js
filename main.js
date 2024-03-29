const tf = require("@tensorflow/tfjs")

async function run(){
    const csvUrl = 'http://localhost:8000/iris.csv';
    const trainingData = tf.data.csv(csvUrl, {
        columnConfigs: {
            species: {
                isLabel: true
            }
        }
    });
    
    const numOfFeatures = (await trainingData.columnNames()).length - 1;
    const numOfSamples = 150;
    const convertedData =
          trainingData.map(({xs, ys}) => {
              const labels = [
                    ys.species == "setosa" ? 1 : 0,
                    ys.species == "virginica" ? 1 : 0,
                    ys.species == "versicolor" ? 1 : 0
              ] 
              return{ xs: Object.values(xs), ys: Object.values(labels)};
          }).batch(10);
    
    const model = tf.sequential();
    model.add(tf.layers.dense({inputShape: [numOfFeatures], activation: "sigmoid", units: 16}))
    model.add(tf.layers.dense({activation: "softmax", units: 3}));
    
    model.compile({loss: "categoricalCrossentropy", optimizer: tf.train.adam(0.06)});
    
    await model.fitDataset(convertedData, 
                     {epochs:100,
                      callbacks:{
                          onEpochEnd: async(epoch, logs) =>{
                              console.log("Epoch: " + epoch + " Loss: " + logs.loss);
                          }
                      }});
    
    // Test Cases:
    
    let flowers =[] 
    flowers[0] ={
        testVal : tf.tensor2d([4.4, 2.9, 1.4, 0.2], [1, 4]),
        fName : "Setosa"
    }
    flowers[1] ={
        testVal : tf.tensor2d([6.4, 3.2, 4.5, 1.5], [1, 4]),
        fName : "Versicolor"
    }
    flowers[2] ={
        testVal : tf.tensor2d([5.8,2.7,5.1,1.9], [1, 4]),
        fName : "Virginica"
    }
    

    for (let index = 0; index < flowers.length; index++) {

        const prediction = model.predict(flowers[index].testVal);
        const pIndex = tf.argMax(prediction, axis=1).dataSync();
        
        const classNames = ["Setosa", "Virginica", "Versicolor"];
        
        // alert(prediction)
        console.log("predicted class for:" ,flowers[index].fName," ----> " ,classNames[pIndex])
        
    }
    
}
run();