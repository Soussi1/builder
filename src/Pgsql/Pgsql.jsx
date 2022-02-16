import CellCont from './CellCont.jsx'
import DetailMetricTest from './StaticVersion/StaticVersion.jsx'
import './style.css'
const Pgsql = (React, Router,Material, Dashboard, grafone,libs) =>{

    const composant = props =>{

        const [country, setCountry] = React.useState([0]);
        const [state, setState] = React.useState([0]);
        const [domains,setDomains]= React.useState([0]);
        const [labels,setLabels] = React.useState([0]);
        const [style,setStyle] = React.useState([0]);
        const [value, setValue] = React.useState(0);
        const [show,setShow] = React.useState(false);
        const [chart,setChart] = React.useState([0]);

        const sites = {"site":[{"resource_name":"name","id":"id","parent":"parent","props":[]}]}
        const dataMap = {"type": "FeatureCollection","features":[]}

        React.useEffect(() => {
            testQuery('performance','MLB')
            getDomains('performance')
            getLabels('performance')
            getStyle()
            getCountry()
        },[])

        const Cell = CellCont(React, Router,Material, Dashboard, grafone)
        const staticChart = DetailMetricTest(React, Router, Material, Dashboard, grafone,libs) 

        function getCountry() {
            let req="select geojson from bytel_meteo.region";
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setCountry(json.response.results.A.tables[0].rows))
        }

        function testQuery(type,trigramme) {
            let req="SELECT dm.resource_name, med.type,med.domain,med.label, TRUNC(cast(dm.value as decimal),2) as value, dm.unit, c.hexcode, '-1' as parent FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.dashboard_metric dm ON mad.metric_key = dm.metric_key JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON dm.color = c.name WHERE resource_name IN (SELECT c.name FROM bytel_meteo.site s JOIN bytel_meteo.link l ON s.site_id = l.site_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id WHERE s.trigramme = '"+trigramme+"') and med.type<>'List' AND med.type='"+type+"' AND time_bucket('5 minute', timestamp_utc) = (select max(time_bucket('5 minute', timestamp_utc)) from bytel_meteo.dashboard_metric) GROUP BY dm.resource_name, med.label, dm.value,c.hexcode,type,med.domain,dm.unit UNION SELECT dam.resource_name, med.type,med.domain,med.label, TRUNC(cast(dam.value as decimal) ,2) as value, dam.unit, c.hexcode, dam.application_name as parent FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.dashboard_application_metric dam ON mad.metric_key = dam.metric_key JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON dam.color = c.name WHERE dam.resource_name IN (SELECT vm.name FROM bytel_meteo.site s JOIN bytel_meteo.link l ON s.site_id = l.site_id JOIN bytel_meteo.application a ON l.application_id = a.application_id JOIN bytel_meteo.virtual_machine vm ON a.application_id = vm.application_id WHERE s.trigramme = '"+trigramme+"') and med.type<>'List' AND med.type='"+type+"' AND time_bucket('5 minute', timestamp_utc) = (select max(time_bucket('5 minute', timestamp_utc)) from bytel_meteo.dashboard_application_metric) GROUP BY dam.resource_name, med.label, dam.value,c.hexcode,type,med.domain,dam.unit,dam.application_name UNION SELECT app.name,null as type,null as domain,null as label,null as value,null as unit,null as hexcode,c.name as parent FROM bytel_meteo.application app JOIN bytel_meteo.link l ON app.application_id=l.application_id JOIN bytel_meteo.cluster c ON l.cluster_id=c.cluster_id JOIN bytel_meteo.site s ON l.site_id=s.site_id WHERE s.trigramme='"+trigramme+"' AND app.name<>'NO APP' ORDER BY resource_name, type, domain,label"
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setState(json.response.results.A.tables[0].rows))
        }
        
        function getDomains(type) {
            let req="SELECT med.domain,count(med.domain) FROM bytel_meteo.matrix_definition mad LEFT JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key where type='"+type+"' group  by type, med.domain ORDER BY type, med.domain"
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setDomains(json.response.results.A.tables[0].rows))
        }

        function getLabels(type) {
            let req="SELECT type,med.domain,med.label FROM bytel_meteo.matrix_definition mad LEFT JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key where type = '"+type+"' and med.label <> 'Nombre de CPU utilisables' ORDER BY  type, med.domain, med.label"
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setLabels(json.response.results.A.tables[0].rows))
        }

        function getStyle() {
            let req = " select * from bytel_meteo.style;"
            grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setStyle(json.response.results.A.tables[0].rows))
        }


        country.map(function(elem){
            //dataMap.features.push(JSON.parse(elem[0]))
            if(elem[0]!==undefined){
                dataMap.features.push(JSON.parse(elem[0]))
            }
        })

        let obj={"resource_name":"","id":"","parent":"","props":[]}
        

        if(state!==undefined && state[0]!==undefined){
        obj.resource_name=(state[0])[0]
        for(let i=0;i<state.length;i++){
            let temp={"type" : "","domain" : "","label" : "","trunc" : 0,"unit" : "","hexcode" : ""}
            
            if(obj.resource_name===(state[i])[0]){
                
                temp.type=(state[i])[1]
                temp.domain=(state[i])[2]
                temp.label=(state[i])[3]
                temp.trunc=(state[i])[4]
                temp.unit=(state[i])[5]
                temp.hexcode=(state[i])[6]

                obj.id=(state[i])[0]
                obj.parent=(state[i])[7]

                obj.props.push(temp)
                
            }
            else{
                sites.site.push(obj)
                obj={"resource_name":"","id":"","parent":"","props":[]}
                obj.resource_name=(state[i])[0]
                i=i-1
            }    
        }
        sites.site.push(obj)
        }

        function TabPanel(props) {
            const { children, value, index, ...other } = props;
            return (
                <div
                    role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}
                    {...other}
                >
                    {value === index && (
                        <Material.Box p={3}>
                            <Material.Typography>{children}</Material.Typography>
                        </Material.Box>
                    )}
                </div>
            );
        }

        function a11yProps(index) {
            return {
                id: `simple-tab-${index}`,
                'aria-controls': `simple-tabpanel-${index}`,
              };
        }

        const handleChange = (event, newValue) => {
            setValue(newValue);
        };

        function firstColumn(val){
            //console.log(val);
            return (
            <div className="supCellContainer" 
                       style={{
                        background:'#1396c1',
                        borderRadius: "5px",
                        height:"100px"
            }}>
                <span style={{
                    color:'white',
                    fontWeight:"bold"
                }}>
                    {val.data.column.caption}
                </span>
            </div>
                
            )
        }

        function supHeaderTitle(val){
            let bg =""
            let ff =""
            let fw =""
            style.map(function (elem) {
                if(elem[0]===val.data.column.caption){
                    bg =elem[1]
                    ff =elem[3]
                    fw=elem[4]
                }
            })
            
            return(
                <div
                    className="supCellContainer"
                    style={{
                        background: bg,
                        borderRadius: "3px"
                    }}
                >
                    <div className="supCellContent">
                        <span style={{
                            fontFamily:ff,
                            color:"white",
                            fontWeight:fw
                        }}>
                            {val.data.column.caption}
                        </span>
                    </div> 
                </div>
            )
        }

        function headerTitle(val){
            let bg =""
            let ff =""
            let fw =""
            style.map(function (elem) {
                if(elem[0]===val.data.column.name){
                    bg =elem[1]
                    ff =elem[3]
                    fw=elem[4]
                }
            })
            
            return (
                <div
                    className="headerCellContainer"
                    style={{
                        background: bg,
                        borderRadius: "3px"
                    }}
                >
                    <div className="cellContent">
                        <span style={{
                            fontFamily:ff,
                            color:"white",
                            fontWeight:fw
                        }}>
                            {val.data.column.caption}
                        </span>
                    </div>
                </div>
            )
        }

        function rowTitles(val){
            
            return (
                <div
                    className="rowCellContainer"
                    style={{
                        background: '#1396c1',
                        borderRadius: "3px",
                    }}
                >
                    <div className="cellContent">
                        <span  className="titlesRow" style={{
                            color:"white",
                            fontWeight:'bold'
                        }}>
                           <a href="#">{val.value}</a>
                        </span>
                    </div>
                </div>
                )
        }

        function chartComponent(){
            console.log(chart);
            return <div>Title: <p>{chart[0]}</p> Label:<p>{chart[1]}</p></div>
        }

        const handleClick = React.useCallback(function(e){
            if(e.column.name!=="main"){
                setShow(true)
                //setChart([e.key,e.column.caption])
                console.log(e.key+'/'+e.column.caption+'/'+e.column.name);
            }
        },[show])

        // function handleClick(e){
        //     if(e.column.name!=="main"){
        //         setShow(true)
        //         setChart([e.key,e.column.caption])
        //         console.log(e.key+'/'+e.column.caption+'/'+e.column.name);
        //     }
            
        // }

        function hide() {
            setShow(false)
        }

        function sorting(obj){
            // console.log(obj.props);
            return obj.props[0].trunc
        }

        function columns(n,m,domain){
            const table =[]
            for(let i=n ; i<m;i++){
                if(labels[i]!==undefined){
                    if((labels[i])[1]===domain){
                        table.push(
                            <libs.DevExTreeColumn
                                caption={(labels[i])[2]}
                                headerCellComponent={headerTitle}
                                dataField="props"
                                cellRender={Cell}
                                alignment="center"
                                allowFixing={true}
                                allowSorting={false}
                                name={domain}
                                minWidth={250}
                                calculateSortValue={sorting}
                            ></libs.DevExTreeColumn>
                        )
                    } 
                }
            }
            return table
        }
        
        function dominantColumn() {
            const table =[]
            let n =0
            let m = 0
            domains.map(function (elem) {
                table.push(
                    <libs.DevExTreeColumn
                        caption={elem[0]}
                        headerCellComponent={supHeaderTitle}
                        alignment="center"
                        allowFixing={true}
                        allowSorting={false}
                    >
                        {columns(n,elem[1]+n+2,elem[0])}
                    </libs.DevExTreeColumn>        
                )
                m=elem[1]
                n=n+m-1
            })
            return table
        }

        function customizeTooltip(arg) {
            const name = arg.attribute('nom')
            return{
                text:`${name}`,
                color: '#5b6cf0',
            }
        }
        function customizeLayer(elements) {
            elements.forEach((element) => {
                const regionColor = element.attribute('color');
                  element.applySettings({
                    color: regionColor,
                  });
              });       
        }

        const MyMap = React.useCallback(({mapdata})=>{
            return(
                <libs.DevExVectorMap
                id="vector-map"
                // bounds={bounds}
                zoomFactor={25}
                // center={center}
                //onClick={handleClick}
                >
                    <libs.DevExMapSize
                    height={1000}
                    /> 
                    <libs.DevExMapLayer 
                    dataSource={mapdata}
                    customize={customizeLayer}
                    >
                    </libs.DevExMapLayer>
                    <libs.DevExMapTooltip enabled={true}
                    customizeTooltip={customizeTooltip}
                    >
                        <libs.DevExMapBorder visible={true}></libs.DevExMapBorder>
                        <libs.DevExMapFont color="#fff"></libs.DevExMapFont>
                    </libs.DevExMapTooltip>
                    <libs.DevExMapExport enabled={true}/>
                </libs.DevExVectorMap>
            )
        })

        const Matrix = React.memo(function ({onClick}){

            return (<React.Fragment>
                <libs.DevExTreeList
                    id="site"
                    dataSource={sites.site}
                    rootValue={-1}
                    showBorders={true}
                    showRowLines={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnResizingMode="widget"
                    style={{ padding: "0px" }}
                    onCellClick={onClick}
                    keyExpr="id"
                    parentIdExpr="parent"
                >
                    <libs.DevExTreeColumnFixing enabled={true} />
                    <libs.DevExTreeScrolling mode="standard" useNative={true}/>
                    
                    <libs.DevExTreeColumnChooser enabled={false} mode={'select'}/>
                    <libs.DevExPopup
                        visible={show}
                        onHiding={hide}
                        dragEnabled={false}
                        closeOnOutsideClick={true}
                        showCloseButton={true}
                        showTitle={true}
                        contentRender={staticChart}
                        title="Information"
                        container=".grid-container"
                        resizeEnabled={true}
                        width={800}
                        height={600}
                    >
                    </libs.DevExPopup>
                    
                    <libs.DevExTreeColumn
                        caption="CLUSTERS D'APPLICATIONS"
                        dataField="resource_name"
                        fixed={true}
                        headerCellComponent={firstColumn}
                        cellRender={rowTitles}
                        minWidth={255}
                        alignment="center"
                        allowSorting={false}
                        name="main"
                    />
                        {dominantColumn()} 
                </libs.DevExTreeList>
                </React.Fragment>)
        })


        // function showMatrix(){
        //     return (
        //         <React.Fragment>
        //         <TreeList
        //             id="site"
        //             dataSource={sites.site}
        //             rootValue={-1}
        //             showBorders={true}
        //             showRowLines={true}
        //             allowColumnReordering={true}
        //             allowColumnResizing={true}
        //             columnResizingMode="widget"
        //             style={{ padding: "0px" }}
        //             onCellClick={handleClick}
        //             keyExpr="id"
        //             parentIdExpr="parent"
        //         >
        //             <ColumnFixing enabled={true} />
        //             <Scrolling mode="standard" useNative={true}/>
                    
        //             <ColumnChooser enabled={false} mode={'select'}/>
        //             <Popup
        //                 visible={show}
        //                 onHiding={hide}
        //                 dragEnabled={false}
        //                 closeOnOutsideClick={true}
        //                 showCloseButton={true}
        //                 showTitle={true}
        //                 contentRender={staticChart}
        //                 title="Information"
        //                 container=".grid-container"
        //                 resizeEnabled={true}
        //                 width={800}
        //                 height={600}
        //             >
        //             </Popup>
                    
        //             <Column
        //                 caption="CLUSTERS D'APPLICATIONS"
        //                 dataField="resource_name"
        //                 fixed={true}
        //                 headerCellComponent={firstColumn}
        //                 cellRender={rowTitles}
        //                 minWidth={255}
        //                 alignment="center"
        //                 allowSorting={false}
        //                 name="main"
        //             />
        //                 {dominantColumn()} 
        //         </TreeList>
        //         </React.Fragment>
        //     )
            
        // }
        console.log(dataMap);
        return(
            <React.Fragment>
                <Material.AppBar position="static" color="default">
                            <Material.Tabs value={value} onChange={handleChange} >
                                <Material.Tab className='tabTitle' label="Performance" {...a11yProps(0)} onClick={()=>{testQuery('performance','MLB');getDomains('performance');getLabels('performance')}}/>
                                <Material.Tab className='tabTitle' label="Capacité" {...a11yProps(1)} onClick={()=>{testQuery('capacity','MLB');getDomains('capacity');getLabels('capacity')}}/>
                                <Material.Tab className='tabTitle' label="conformité" {...a11yProps(2)} />
                            </Material.Tabs>
                </Material.AppBar>
                <TabPanel value={value} index={0}>
                <Material.TableContainer component={Material.Paper}>
                    {/* {showMatrix()} */}
                    <Matrix onClick={handleClick}/>
                </Material.TableContainer> 
                </TabPanel>

                <TabPanel value={value} index={1}>
                    {/* {showMatrix()} */}
                    <MyMap mapdata={dataMap}/>
               
                </TabPanel>
                <TabPanel value={value} index={3}></TabPanel>
                
            </React.Fragment>
            
        )

    }
    return composant
}
export default Pgsql