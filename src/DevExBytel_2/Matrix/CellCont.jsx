import './style.css'
const CellCont = (React, Router,Material, Dashboard, grafone,style) =>{
    const composant = cellData =>{

        function gridCellData(gridData) {
            return gridData.data[gridData.column.dataField];
        }
        
        let value=0
        let unit =""
        let color=""
        
        let cell = gridCellData(cellData);
        
        for(let i=0;i<cell.length;i++){
            if(cell[i]!==undefined){
                if(cellData.column.metricKey===cell[i].metric_key && cellData.column.domain===cell[i].domain ){
                    value=cell[i].trunc
                    unit=cell[i].unit
                    color=cell[i].hexcode
                } 
            }
        }
        
        let cl=""
        let ff=""
        let fw=""
        style.map(function (elem) {
            if(elem[0]==='cellContent'){
                cl =elem[1]
                ff =elem[3]
                fw=elem[4]
            }
        })

        function numberFormatter(n){
            if(n!==null){return n.toLocaleString('fr-FR')}
            return n
            
        }

        return(
            <div
            className="cellContainer"
            style={{
                background: color,
                borderRadius: "3px",
                paddingLeft: "4px",
                paddingRight: "4px"
            }}
            >
                <div className="cellContent">
                <span className="indicatorCell" style={{
                    color:cl,
                    fontFamily:ff,
                    fontWeight:fw
                }}>
                {numberFormatter(value)} {unit}
                </span>
                </div>
            </div>
            
        )
    }
    return composant
}
export default CellCont