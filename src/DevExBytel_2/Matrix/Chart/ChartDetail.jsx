//import 'D:/MODULE-BUILDER-SOMONE/grafone-componets/node_modules/devextreme/dist/css/dx.common.css';
// import 'D:/MODULE-BUILDER-SOMONE/grafone-componets/node_modules/devextreme/dist/css/dx.light.css';

import './style.css';

const ChartDetail = (React, Router, Material, Dashboard, grafone,libs,data,style) => {

    const Composant = props => {

       
//  console.log(data);
    let caption = localStorage.getItem('caption')
    let name = localStorage.getItem('clusterName')
    let fullMetricName = localStorage.getItem('metricFullName')
    var colorOfSubtitel = ""
    var sizeOfSubtitel = 0
    var weightOfSubtitel = 0
    
    var colorOfTitel = ""
    var sizeOfTitel = 0
    var weightOfTitel = 0

    var colorOfLabels = ""
    var sizeOfLabels = 0
    var weightOfLabels = 0

      
     
    style.map(function(elem) {
        if(elem[0]==="Subtitel"){
            colorOfSubtitel=elem[1]
            sizeOfSubtitel=elem[2]
            weightOfSubtitel=parseInt(elem[4],10)
           
        }
        else if(elem[0]==="Titel"){
            colorOfTitel=elem[1]
            sizeOfTitel=elem[2]
            weightOfTitel=parseInt(elem[4],10)
           
           
        }

        else if(elem[0]==="Labels"){
            colorOfLabels=elem[1]
            sizeOfLabels=elem[2]
            weightOfLabels=parseInt(elem[4],10)
            
        }
    })

    function customizeTooltip(pointInfo) {
        return {
          text: `${pointInfo.argumentText}<br/>${'Value : '+pointInfo.valueText}`
        };
    }

    // console.log("get chart style ",style);

      return (
          <div>
            <h2>Détails</h2>
            <libs.DevExChart id="chart" dataSource={data}>
                <libs.DevExChartSeries
                valueField="value"
                argumentField="day"
                name={caption}
                type="line"
                color="#1396C1" />
                <libs.DevExChartArgumentAxis
                    argumentType="datetime">
                       
                   <libs.DevExChartLabel visible={true} format="shortTime">
                        <libs.DevExChartFont color={colorOfLabels} size={sizeOfLabels} />
                   </libs.DevExChartLabel>
                   <libs.DevExChartGrid visible={true} />
                </libs.DevExChartArgumentAxis>
                <libs.DevExChartValueAxis
                name="value"
                >
                <libs.DevExChartValueAxis text={'Valeurs'}>
                    <libs.DevExChartFont color="#1396C1" />
                </libs.DevExChartValueAxis>
                <libs.DevExChartLabel visible={true}>
                <libs.DevExChartFont color={colorOfLabels} size={sizeOfLabels} />
                </libs.DevExChartLabel>
               

                </libs.DevExChartValueAxis>
                <libs.DevExChartTitle text={name} >
                    <libs.DevExChartSubtitle text={fullMetricName}>
                        <libs.DevExChartFont color={colorOfSubtitel} size={sizeOfSubtitel} weight={weightOfSubtitel} />
                    </libs.DevExChartSubtitle>
                    <libs.DevExChartFont size={sizeOfTitel} weight={weightOfTitel} />
                </libs.DevExChartTitle>
                <libs.DevExChartTooltip
                    container=".dx-popup-content"
                    enabled={true}
                    customizeTooltip={customizeTooltip}
                />
                <libs.DevExChartExport id="Export" enabled={true} />
                <libs.DevExChartZoomAndPan
                argumentAxis="both"
                valueAxis="both"
                />
                <libs.DevExChartScrollBar
                    visible={true}
                />
                <libs.DevExChartMargin
                
                left={30}
                right={30}
                />
              
            </libs.DevExChart>
            </div>
      );

    
    }
 
 
      
    return Composant
}

export default ChartDetail