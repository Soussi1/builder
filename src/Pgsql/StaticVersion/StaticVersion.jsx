import './style.css';
import dataSource from './data.json';


const DetailMetricTest = (React, Router, Material, Dashboard, grafone,libs) => {

    const Composant = props => {

      function customizeTooltip(pointInfo) {
        return {
          text: `${pointInfo.argumentText}<br/>${pointInfo.valueText}`
        };
      }
   
      return (
        <libs.DevExChart id="chart" dataSource={dataSource}>
              <libs.DevExChartSeries
              valueField="value"
              argumentField="day"
              name="Capacité Totale Recommandé"
              type="line"
              color="#ffaa66" />
              <libs.DevExChartArgumentAxis>
              <libs.DevExChartLabel format="shortTime" />
              </libs.DevExChartArgumentAxis>
              <libs.DevExChartValueAxis
              name="value"
              >
                < libs.DevExChartTitle text={'Valeurs, GHz'}>
                  <libs.DevExChartFont color="#ffaa66" />
                </ libs.DevExChartTitle>
              </libs.DevExChartValueAxis>
              <libs.DevExChartTitle text="IT-RES">
                  <libs.DevExChartSubtitle text="Analyses de capacité générées|CPU|Demande|Capacité totale recommandée (GHz)" />
              </libs.DevExChartTitle>
              <libs.DevExChartTooltip
                  container=".dx-popup-content"
                  enabled={true}
                  customizeTooltip={customizeTooltip}
              />
              <libs.DevExChartExport enabled={true} />
              <libs.DevExChartZoomAndPan
                argumentAxis="both"
                valueAxis="both"
              />
              <libs.DevExChartScrollBar
                  visible={true}
              />
              {/* <AdaptiveLayout
                keepLabels={true}
              /> */}
          </libs.DevExChart>
      );
    }

 
      
    return Composant
}

export default DetailMetricTest