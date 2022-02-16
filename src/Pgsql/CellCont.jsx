import './style.css'
const CellCont = (React, Router,Material, Dashboard, grafone) =>{
    const composant = cellData =>{

        function gridCellData(gridData) {
            return gridData.data[gridData.column.dataField];
        }
        // console.log('only cellData');
        // console.log(cellData);
        // console.log(cellData.columnIndex);
        let value=0
        let unit =""
        let color=""
        
        let j= cellData.column.name
        let cell = gridCellData(cellData);
        // console.log('only cell');
        // console.log(cell);
        for(let i=0;i<cell.length;i++){
            if(cell[i]!==undefined){
                if(cellData.column.caption===cell[i].label && cellData.column.name===cell[i].domain ){
                    value=cell[i].trunc
                    unit=cell[i].unit
                    color=cell[i].hexcode
                } 
            }
        }
        
        // if(cell[j]!==undefined){
        //     if(cellData.column.caption===cell[j].label){
        //         value=cell[j].trunc
        //         unit=cell[j].unit
        //         color=cell[j].hexcode
        //     }
        //     else{
        //         j=j+1
        //     } 
        // }

        return(
            <div
            className="cellContainer"
            style={{
                background: color,
                borderRadius: "3px",
            }}
            >
                <div className="cellContent">
                <span className="indicatorCell" style={{
                    color:'white',
                }}>
                {value} {unit}
                </span>
                </div>
            </div>
            
        )
    }
    return composant
}
export default CellCont