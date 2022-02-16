import CellCont from './CellCont.jsx'
import ChartDetail from './Chart/ChartDetail.jsx'
import './style.css'

require('../Styles/common.css')


const Matrix = (React, Router,Material, Dashboard, grafone, libs) =>{

    const composant =props =>{

        const [state, setState] = React.useState([0]);
        const [domains,setDomains]= React.useState([0]);
        const [labels,setLabels] = React.useState([0]);
        const [style,setStyle] = React.useState([0]);
        const [value, setValue] = React.useState(parseInt(props.location.search.split('?')[1]));
        const [chart,setChart] = React.useState([0]);
        const [show,setShow] = React.useState(false);
        const [cellInfo,setCellInfo]=React.useState([0]);
        const [applications,setApplications] = React.useState([0]);
        const [time,setTime] = React.useState("1 hour");
        const history = Router.useHistory();
        const region = props.match.params.regionName
        const trigramme = props.match.params.siteTrig
        const [fullName,setFullName]=React.useState("");
      
        const sizeOfMatrix = screen.availHeight/1.2
        console.log(sizeOfMatrix);
        const intervalData = [
            { "id":"1 hour", "Text": "last hour" },
            { "id": "12 hours", "Text": "last 12 hours" },
            { "id": "24 hours", "Text": "last 24 hours" },
            { "id": "1 week", "Text": "last week" },
            { "id": "1 month", "Text": "last month" },
            { "id": "2 months", "Text": "last 2 months" },
            { "id": "3 months", "Text": "last 3 months" },
            { "id": "6 weeks", "Text": "last 6 weeks" },
            { "id": "today", "Text": "last day" },
            { "id": "6 months", "Text": "last 6 months" },
            { "id": "1 year", "Text": "last year" }, 
        ];
         
        const event = new Date();
        const dateNow = 'Dernière mise à jour : ' + event.toLocaleString();

        React.useEffect( ()=>{
            const timer =setTimeout(() => {
                if(value===0){
                    testQuery('performance',props.match.params.siteTrig)
                    getDomains('performance')
                    getLabels('performance')
                    getApplications('performance',props.match.params.siteTrig)
                }
                else if(value===1){
                    testQuery('capacity',props.match.params.siteTrig)
                    getDomains('capacity')
                    getLabels('capacity')
                    getApplications('capacity',props.match.params.siteTrig)
                }
                else if(value===2){
                    testQuery('FORECAST',props.match.params.siteTrig)
                    getDomains('FORECAST')
                    getLabels('FORECAST')
                    getApplications('FORECAST',props.match.params.siteTrig)
                }
                getStyle()
              }, 1);
              return () => clearTimeout(timer);
        },[value])

        const Cell = CellCont(React, Router,Material, Dashboard, grafone,style)

        function testQuery(type,trigramme) {
            if(type==="FORECAST"){
                let req="SELECT lmf.resource_name, med.type,med.domain,med.label, TRUNC(cast(lmf.value as decimal),2) as value, lmf.unit, c.hexcode, '-1' as parent,lmf.resource_id as id, mad.metric_key FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.last_metric_forecast lmf ON mad.metric_key = lmf.metric_key JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON lmf.color = c.name WHERE resource_id IN (SELECT c.cluster_id FROM bytel_meteo.site s JOIN bytel_meteo.link l ON s.site_id = l.site_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id WHERE s.trigramme = '"+trigramme+"') AND med.type='"+type+"' GROUP BY lmf.resource_name, med.label, lmf.value,c.hexcode,type,med.domain,lmf.unit,lmf.resource_id, mad.metric_key ORDER BY lmf.resource_name, med.type, med.domain,med.label"
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
            else{
                let req="SELECT lmc.resource_name, med.type,med.domain,med.label, TRUNC(cast(lmc.value as decimal),2) as value, lmc.unit, c.hexcode, '-1' as parent ,lmc.resource_id as id, mad.metric_key FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.last_metric_cluster lmc ON mad.metric_key = lmc.metric_key JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON lmc.color = c.name WHERE resource_id IN (SELECT c.cluster_id FROM bytel_meteo.site s JOIN bytel_meteo.link l ON s.site_id = l.site_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id WHERE s.trigramme = '"+trigramme+"') AND med.type='"+type+"' GROUP BY lmc.resource_name, med.label, lmc.value,c.hexcode,med.type,med.domain,lmc.unit,lmc.resource_id, mad.metric_key UNION SELECT lma.resource_name, type,med.domain,med.label, TRUNC(cast(lma.value as decimal) ,2) as value, lma.unit, c.hexcode, a.application_id::text as parent, lma.resource_id as id, mad.metric_key FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.last_metric_application lma ON mad.metric_key_vm = lma.metric_key JOIN  bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON lma.color = c.name JOIN bytel_meteo.application a ON lma.application_name=a.name JOIN bytel_meteo.link l ON a.application_id=l.application_id JOIN bytel_meteo.cluster cl ON l.cluster_id=cl.cluster_id JOIN bytel_meteo.site s ON l.site_id=s.site_id WHERE s.trigramme = '"+trigramme+"' AND med.type = '"+type+"' GROUP BY lma.resource_name, med.label, lma.value,c.hexcode,type,med.domain,lma.unit,a.application_id,lma.resource_id,lma.metric_key, mad.metric_key UNION SELECT lma.resource_name, med.type,med.domain,med.label, TRUNC(cast(lma.value as decimal) ,2) as value, lma.unit, c.hexcode, a.application_id::text as parent,lma.resource_id as id, mad.metric_key FROM bytel_meteo.matrix_definition mad JOIN bytel_meteo.last_metric_application lma ON mad.metric_key_vm_bse = lma.metric_key JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key JOIN bytel_meteo.color c ON lma.color = c.name JOIN bytel_meteo.application a ON lma.application_name=a.name JOIN bytel_meteo.link l ON a.application_id=l.application_id JOIN bytel_meteo.cluster cl ON l.cluster_id=cl.cluster_id JOIN bytel_meteo.site s ON l.site_id=s.site_id WHERE s.trigramme = '"+trigramme+"' AND med.type = '"+type+"' GROUP BY lma.resource_name, med.label, lma.value,c.hexcode,type,med.domain,lma.unit,a.application_id,lma.resource_id, mad.metric_key UNION SELECT app.name,null as type,null as domain,null as label,null as value,null as unit,null as hexcode,c.cluster_id as parent,app.application_id::text as id,null FROM bytel_meteo.application app JOIN bytel_meteo.link l ON app.application_id=l.application_id JOIN bytel_meteo.cluster c ON l.cluster_id=c.cluster_id JOIN bytel_meteo.site s ON l.site_id=s.site_id WHERE s.trigramme = '"+trigramme+"' AND app.name <> 'NO APP' ORDER BY resource_name, type, domain,label"
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
            let req="SELECT med.type,med.domain,med.label,med.metric_key FROM bytel_meteo.matrix_definition mad left JOIN bytel_meteo.metric_definition med ON mad.metric_key = med.metric_key where type = '"+type+"' and med.label <> 'Nombre de CPU utilisables' GROUP BY med.type, med.domain, med.label, med.metric_key ORDER BY  med.type, med.domain, med.label"
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

        function getApplications(type,trigramme) {
            if(type==="FORECAST"){
            let req = "select lmf.resource_name, max(concat(c.level,':',c.hexcode)) as color, s.trigramme, lmf.resource_id as id from bytel_meteo.last_metric_forecast lmf inner join bytel_meteo.color c on lmf.color=c.name inner join bytel_meteo.link l on lmf.resource_id=l.cluster_id inner join bytel_meteo.site s on l.site_id=s.site_id inner join bytel_meteo.metric_definition md on lmf.metric_key=md.metric_key where md.type = '"+type+"' group by lmf.resource_name,l.site_id,s.name,s.trigramme,lmf.resource_id order by color desc"
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,

                    body: {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                    }
                }).then((response) => response.json())
                .then((json) => setApplications(json.response.results.A.tables[0].rows))
            }
            else{
            let req = "select lmc.resource_name, max(concat(c.level,':',c.hexcode)) as color, s.trigramme, lmc.resource_id as id from bytel_meteo.last_metric_cluster lmc inner join bytel_meteo.color c on lmc.color=c.name inner join bytel_meteo.link l on lmc.resource_id=l.cluster_id inner join bytel_meteo.site s on l.site_id=s.site_id inner join bytel_meteo.metric_definition md on lmc.metric_key=md.metric_key where md.type = '"+type+"' group by lmc.resource_name,l.site_id,s.name,s.trigramme,lmc.resource_id UNION SELECT lma.application_name,max(concat(c.level,':',c.hexcode)) as color,s.trigramme, a.application_id::text as id FROM bytel_meteo.last_metric_application lma JOIN bytel_meteo.application a ON lma.application_name=a.name JOIN bytel_meteo.virtual_machine vm ON a.application_id=vm.application_id JOIN bytel_meteo.link l ON a.application_id=l.application_id JOIN bytel_meteo.cluster cl ON l.cluster_id=cl.cluster_id JOIN bytel_meteo.site s ON l.site_id=s.site_id JOIN bytel_meteo.color c ON lma.color = c.name JOIN bytel_meteo.metric_definition md on lma.metric_key=md.metric_key WHERE s.trigramme = '"+trigramme+"' AND md.type = '"+type+"' GROUP BY lma.application_name,s.trigramme,a.application_id UNION select lma.resource_name, max(concat(c.level,':',c.hexcode)) as color,s.trigramme, lma.resource_id as id from bytel_meteo.last_metric_application lma inner join bytel_meteo.color c on lma.color=c.name inner join bytel_meteo.metric_definition md on lma.metric_key=md.metric_key inner join bytel_meteo.application a ON lma.application_name=a.name JOIN bytel_meteo.virtual_machine vm ON a.application_id=vm.application_id join bytel_meteo.link l ON a.application_id=l.application_id join bytel_meteo.site s ON l.site_id=s.site_id where md.type = '"+type+"' and s.trigramme='"+trigramme+"' group by lma.resource_name,l.site_id,s.name,s.trigramme,lma.resource_id order by color desc"
            grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,

                    body: {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                    }
                }).then((response) => response.json())
                .then((json) => setApplications(json.response.results.A.tables[0].rows))
            }
            
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

        function getChart(domain,label,name,isParent,time,val) {
            
            if(val===2){
                let req="SELECT dfm.timestamp_utc,dfm.value FROM bytel_meteo.dashboard_forecast_metric dfm JOIN bytel_meteo.link l ON dfm.resource_id = l.cluster_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id JOIN bytel_meteo.metric_definition md ON dfm.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"' AND c.cluster_id = '"+name+"' AND dfm.timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_metric) - INTERVAL '"+time+"' "
                // console.log(req);
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setChart(json.response.results.A.tables[0].rows)) 
            }
            if(isParent==="-1"){
                let req = "SELECT dm.timestamp_utc,dm.value FROM bytel_meteo.dashboard_metric dm JOIN bytel_meteo.link l ON dm.resource_id = l.cluster_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id JOIN bytel_meteo.metric_definition md ON dm.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"' AND c.cluster_id = '"+name+"' AND timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_metric) - INTERVAL '"+time+"'"
                
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setChart(json.response.results.A.tables[0].rows))   
            }
            else{
                let req = "SELECT dam.timestamp_utc,dam.value FROM bytel_meteo.dashboard_application_metric dam JOIN bytel_meteo.virtual_machine vm ON dam.resource_name = vm.name WHERE dam.metric_key=(select mad.metric_key_vm from bytel_meteo.matrix_definition mad join bytel_meteo.metric_definition md on mad.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"') AND vm.vm_id = '"+name+"' AND timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_application_metric) - INTERVAL '"+time+"' "
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setChart(json.response.results.A.tables[0].rows))
            }  
        }

        function getFullName(domain,label,name,isParent,val) {
            if(val===2){
                let req="SELECT dfm.metric_full_name FROM bytel_meteo.dashboard_forecast_metric dfm JOIN bytel_meteo.link l ON dfm.resource_id = l.cluster_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id JOIN bytel_meteo.metric_definition md ON dfm.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"' AND c.cluster_id = '"+name+"' AND dfm.timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_metric) - INTERVAL '1 hour' group by dfm.metric_full_name"
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setFullName(json.response.results.A.tables[0].rows)) 
            }
            if(isParent==="-1"){
                //console.log(domain+'/'+label+'/'+name);
                let req = "SELECT dm.metric_full_name FROM bytel_meteo.dashboard_metric dm JOIN bytel_meteo.link l ON dm.resource_id = l.cluster_id JOIN bytel_meteo.cluster c ON l.cluster_id = c.cluster_id JOIN bytel_meteo.metric_definition md ON dm.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"' AND c.cluster_id = '"+name+"' AND timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_metric) - INTERVAL '1 hour' group by dm.metric_full_name"
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setFullName(json.response.results.A.tables[0].rows))   
                   
            }
            else{
                let req = "SELECT dam.metric_full_name FROM bytel_meteo.dashboard_application_metric dam JOIN bytel_meteo.virtual_machine vm ON dam.resource_name = vm.name WHERE dam.metric_key = ( select mad.metric_key_vm from bytel_meteo.matrix_definition mad join bytel_meteo.metric_definition md on mad.metric_key=md.metric_key WHERE md.domain='"+domain+"' AND md.metric_key='"+label+"') AND vm.vm_id = '"+name+"' AND timestamp_utc >= (select max(timestamp_utc) from bytel_meteo.dashboard_application_metric) - INTERVAL '1 hour' GROUP BY dam.metric_full_name"
                grafone.post('grafana',
                    {
                        methode: 'POST',
                        path: `tsdb/query`,
    
                        body: {
                            "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql": req, "format": "table" }]
                        }
                    }).then((response) => response.json())
                    .then((json) => setFullName(json.response.results.A.tables[0].rows))
            }  
        } 

        if(fullName!==""){
            var fname =fullName
        }

        localStorage.setItem('metricFullName',fname);

        

        const allSites = React.useMemo(()=>{
            var start = new Date().getTime();
            const sites = {"site":[]}
            let obj={"resource_name":"","id":"","parent":"","props":[]}
            let tempId = ""

            if(state!==undefined && state[0]!==undefined){
            obj.resource_name=(state[0])[0]
            //obj.parent=(state[0])[7] //new line
            tempId=(state[0])[8]
            for(let i=0;i<state.length;i++){
                let temp={"type" : "","domain" : "","label" : "","trunc" : 0,"unit" : "","hexcode" : "","metric_key":""}
                
                //if(obj.resource_name===(state[i])[0] && obj.parent===(state[i])[7]){//new comparison
                if(tempId===(state[i])[8]){
                    
                    temp.type=(state[i])[1]
                    temp.domain=(state[i])[2]
                    temp.label=(state[i])[3]
                    temp.trunc=(state[i])[4]
                    temp.unit=(state[i])[5]
                    temp.hexcode=(state[i])[6]
                    temp.metric_key=(state[i])[9]

                    obj.id=(state[i])[8]
                    obj.parent=(state[i])[7]

                    obj.props.push(temp)
                    
                }
                else{
                    sites.site.push(obj)
                    obj={"resource_name":"","id":"","parent":"","props":[]}
                    obj.resource_name=(state[i])[0]
                    //obj.parent=(state[i])[7] //new line
                    tempId=(state[i])[8]
                    i=i-1
                }    
            }
            sites.site.push(obj)
            }
            var end= new Date().getTime()
            var timing = end - start
            console.log("Execution time: "+timing)
            return sites
        },[state,value])

        

        const TabPanel = React.useCallback(props=>{
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
        },[value])

        const handleChange = (event, newValue) => {
            setValue(newValue);
        };

        const handleCharsLimit = (text) => {
            if (text.length > 30) {
                return text.substring(0, 30) + '..';
            }
            return text.substring(0, 30);
        }

        const firstColumn = React.useCallback((val)=>{
            let ff =""
            let fw =""
            let bg=""
            let clr=""
            let fs=""
            style.map(function (elem) {
                if(elem[0]===val.data.column.name){
                    clr=elem[1]
                    fs=elem[2]
                    ff =elem[3]
                    fw=elem[4]
                    bg=elem[5]
                }
            })
            return (
            <div className="supCellContainer" 
                       style={{
                        background:bg,
                        borderRadius: "5px",
                        height:"100px",
                        fontSize:fs
            }}>
                <span style={{
                    fontFamily:ff,
                    color:clr,
                    fontWeight:fw
                }}>
                    {val.data.column.caption}
                </span>
            </div>
                
            )
        },[style])

        const supHeaderTitle = React.useCallback((val)=>{
            let bg =""
            let ff =""
            let fw =""
            let clr=""
            let fs=""
            style.map(function (elem) {
                if(elem[0]===val.data.column.caption){
                    
                    bg =elem[1]
                    fs=elem[2]
                    ff =elem[3]
                    fw=elem[4]
                    clr=elem[5]
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
                            color:clr,
                            fontWeight:fw,
                            fontSize:fs
                        }}>
                            {val.data.column.caption}
                        </span>
                    </div> 
                </div>
            )
        },[style])

        const headerTitle = React.useCallback((val)=>{
            let bg =""
            let ff =""
            let fw =""
            let clr=""
            style.map(function (elem) {
                if(elem[0]===val.data.column.domain){
                    bg =elem[1]
                    ff =elem[3]
                    fw=elem[4]
                    clr=elem[5]
                }
            })
            
            return (
                <div
                    className="headerCellContainer"
                    style={{
                        background: bg,
                        borderRadius: "3px",
                        paddingLeft: "4px",
                        paddingRight: "4px"
                    }}
                >
                    <div className="cellContent">
                        <span style={{
                            fontFamily:ff,
                            color:clr,
                            fontWeight:fw
                        }}>
                            {val.data.column.caption}
                        </span>
                    </div>
                </div>
                )
        },[style])

        const rowTitles = React.useCallback((val)=>{
            let clr =""
            let ff =""
            let fw =""
            let bg =""
            style.map(function (elem) {
                if(elem[0]===val.column.name){
                    clr=elem[1]
                    ff =elem[3]
                    fw=elem[4]
                    bg=elem[5]
                }
            })
            for (let i = 0; i < applications.length; i++) {
                if((applications[i])[0] !== undefined && (applications[i])[1]!== undefined){
                if ( val.key === (applications[i])[3]) {
                    if(val.data.parent === '-1'){
                        return (
                            <div
                                className="rowCellContainer"
                                style={{
                                    background: (applications[i])[1].split(':')[1],
                                    borderRadius: "3px",
                                }}
                                >
                                <div className="cellContent">
                                    <span  className="titlesRow" style={{
                                        fontWeight:fw,
                                        fontFamily:ff
                                    }}>
                                        <Router.Link style={{color:clr}} to={'/dashboard/'+Dashboard.id+'/'+region+'/'+trigramme+'/'+val.value+'?'+value+'?'+val.key} title={val.value}>{handleCharsLimit(val.value)}</Router.Link>
                                    </span>
                                </div>
                            </div>
                        )
                    }
                    return (
                        <div
                            className="rowCellContainer"
                            style={{
                                background: (applications[i])[1].split(':')[1],
                                borderRadius: "3px",
                            }}
                            >
                            <div className="cellContent">
                                <span  className="titlesRow" style={{
                                    fontWeight:fw,
                                    fontFamily:ff
                                }}>
                                    <div style={{color:clr}} title={val.value}>{handleCharsLimit(val.value)}</div>
                                </span>
                            </div>
                        </div>
                    )
                    
                }
                
                } 
            } 
            return (
            <div
                className="rowCellContainer"
                style={{
                    background: bg,
                    borderRadius: "3px",
                }}
            >
                <div className="cellContent">
                    <span  className="titlesRow" style={{
                        fontFamily:ff,
                        color:clr,
                        fontWeight:fw
                    }}>
                        {/* <Router.Link to={'/dashboard/'+Dashboard.id+'/'+region+'/'+trigramme+'/'+val.value} title={val.value}>{handleCharsLimit(val.value)}</Router.Link> */}
                        <div style={{color:clr}} title={val.value}>{handleCharsLimit(val.value)}</div>
                    </span>
                </div>
            </div>
        )
        },[style,applications])


        function handleClick(e){
            console.log(e);
            
            if(e.column.name!=="mainColumn" && e.rowType!=='header'){
                setShow(true)
                setCellInfo([e.column.domain,e.column.metricKey,e.key,e.data.parent])
                getChart(e.column.domain,e.column.metricKey,e.key,e.data.parent,time,value)
                getFullName(e.column.domain,e.column.metricKey,e.key,e.data.parent,value)
                localStorage.setItem("caption",e.column.caption)
                localStorage.setItem("clusterName",e.data.resource_name)
            }
        }

        

        function hide() {
            setShow(false)
            setTime("1 hour")
            setChart([0])
        }

        const columns = React.useCallback((n,m,domain)=>{
            const table =[]
            for(let i=n ; i<m;i++){
                if(labels[i]!==undefined){
                    if((labels[i])[1]===domain){
                        table.push(
                            <libs.DevExTreeColumn
                                //cssClass="header-titles"
                                caption={(labels[i])[2]}
                                headerCellComponent={headerTitle}
                                dataField="props"
                                cellRender={Cell}
                                alignment="center"
                                allowFixing={true}
                                allowSorting={false}
                                name={(labels[i])[3]}
                                domain={domain}
                                //minWidth={260}
                                metricKey={(labels[i])[3]}
                                
                            ></libs.DevExTreeColumn>
                        )
                    } 
                }
            }
            return table
        },[labels,headerTitle,Cell,value])

        const dominantColumn = React.useCallback(()=>{
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
        },[domains,supHeaderTitle,columns,value])
        
        
        const chartData = []
        chart.map(function (elem) {
            let temp = {day: "",value: 0}
            temp.day= elem[0]
            temp.value=elem[1]
            chartData.push(temp)
        })
        
        if(chartData[0]!==undefined){
            var graphData = chartData
        }
        console.log(graphData);
       
        const ChartD = ChartDetail(React, Router,Material, Dashboard, grafone,libs,graphData,style)
        
        function selectItem(e) {
            setTime(e.selectedItem.id)  
        }
        
        function getNewChart(e) {
            
            getChart(cellInfo[0],cellInfo[1],cellInfo[2],cellInfo[3],e.value,value)
        }
        
        const ShowMatrix = React.useCallback(()=>{

            return (
                <libs.DevExTreeList
                    id="site"
                    dataSource={allSites.site}
                    //defaultColumns={columns}
                    rootValue={-1}
                    showBorders={true}
                    showRowLines={true}
                    allowColumnReordering={false}
                    allowColumnResizing={false}
                    columnAutoWidth={true}
                    columnWidth='auto'
                    columnResizingMode="widget"
                    style={{ padding: "0px" }}
                    onCellClick={handleClick}
                    keyExpr="id"
                    parentIdExpr="parent"
                    errorRowEnabled={false}
                    cacheEnabled={true}
                    height={sizeOfMatrix}
                >
                    {/* <LoadPanel
                        enabled={true}
                    ></LoadPanel> */}
                    {/* <ColumnFixing enabled={true} /> */}
                    <libs.DevExTreeScrolling mode="standard" useNative={true}/>
                    {/* <libs.DevExTreePaging
                        enabled={true}
                        defaultPageSize={sizeOfMatrix}
                    /> */}
                    <libs.DevExTreeColumnChooser enabled={false} mode={'select'}/>
                    <libs.DevExTreeColumn
                        caption="CLUSTERS D'APPLICATIONS"
                        dataField="resource_name"
                        fixed={true}
                        headerCellComponent={firstColumn}
                        cellRender={rowTitles}
                        minWidth={300}
                        alignment="center"
                        allowSorting={false}
                        name="mainColumn"
                    />
                        {dominantColumn()} 
                        
                </libs.DevExTreeList>
            )
        },[value,allSites,rowTitles])

        function mySelectBox(){
            return(
                <libs.DevExSelectBox
                    dataSource={intervalData}
                    value={time}
                    valueExpr="id"
                    displayExpr="Text"
                    onValueChanged={getNewChart}
                    onSelectionChanged={selectItem}
                    // selectedItem={selectedItem}
                    displayValue="Text"  
                />
            )
        }

        function myPopup(){
            return(
                <libs.DevExPopup
                    visible={show}
                    onHiding={hide}
                    //onShowing={onShownFunc}
                    dragEnabled={false}
                    closeOnOutsideClick={true}
                    showCloseButton={true}
                    showTitle={true}
                    contentRender={ChartD}
                    container=".grid-container"
                    resizeEnabled={true}
                    width={900}
                    height={450}
                >
                    <libs.DevExPopupToolbarItem
                        render={mySelectBox}
                        location='before'
                    ></libs.DevExPopupToolbarItem>
                </libs.DevExPopup>
            )
        }

        console.log(value);
        
        return(
            <React.Fragment>
                <Material.Paper elevation={2} className="title">
                    <Material.Chip color="primary" label="Home" style={{ fontWeight: 'bold' }} className="back" onClick={() => {history.push('/dashboard/'+Dashboard.id)}} />
                    <div className={'navigationShip'}>
                    <p onClick={() => {history.push('/dashboard/'+Dashboard.id+'?'+value)}} style={{ color: 'blue', cursor: 'pointer', display: 'inline' }}>Carte de France</p>
                    <p style={{ color: 'blue', cursor: 'pointer', display: 'inline' }} onClick={() => history.push('/dashboard/'+Dashboard.id+'/'+region+'?'+value)}> > {region}</p>
                    <p style={{ display: 'inline' }}> > {props.match.params.siteTrig}</p>
                    </div>
                    <div className={'navigationShip'}>
                    <p style={{ display: 'inline' }}>{dateNow}</p>
                    </div>
                </Material.Paper>
                <Material.AppBar position="static" color="default">
                            <Material.Tabs value={value} onChange={handleChange} >
                                <Material.Tab className='tabTitle' label="Performance"  onClick={async()=>{testQuery('performance',props.match.params.siteTrig);getDomains('performance');getLabels('performance');getApplications('performance',props.match.params.siteTrig)}}/>
                                <Material.Tab className='tabTitle' label="Capacité"  onClick={async()=>{testQuery('capacity',props.match.params.siteTrig);getDomains('capacity');getLabels('capacity');getApplications('capacity',props.match.params.siteTrig)}}/>
                                <Material.Tab className='tabTitle' label="Forecast" onClick={async()=>{testQuery('FORECAST',props.match.params.siteTrig);getDomains('FORECAST');getLabels('FORECAST');getApplications('FORECAST',props.match.params.siteTrig)}}/>
                                <Material.Tab className='tabTitle' label="conformité"  />
                            </Material.Tabs>
                </Material.AppBar>
                <TabPanel value={value} index={0}>
                    {myPopup()}
                    {/* <MyPopup/> */}
                    <ShowMatrix/>
                </TabPanel>

                <TabPanel value={value} index={1}>
                    {myPopup()}
                    {/* <MyPopup/> */}
                    <ShowMatrix/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    {myPopup()}
                    {/* <MyPopup/> */}
                    <ShowMatrix/>
                </TabPanel>
                <TabPanel value={value} index={3}>
                <svg width="150pt" height="150pt" viewBox="0 0 320 320" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '6%',marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                    <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 154.6 0.0 L 165.2 0.0 C 171.0 1.5 177.3 2.3 182.1 6.0 C 185.6 8.3 189.3 10.6 192.3 13.6 C 230.1 51.5 268.0 89.3 305.9 127.2 C 313.2 134.7 318.4 144.3 320.0 154.7 L 320.0 165.8 C 318.7 170.3 317.9 174.9 315.9 179.1 C 312.8 183.9 309.9 188.9 305.8 192.8 C 268.3 230.4 230.7 267.9 193.2 305.5 C 185.6 313.0 176.0 318.4 165.4 320.0 L 154.7 320.0 C 144.3 318.4 134.8 313.2 127.3 306.0 C 89.3 267.9 51.3 230.0 13.3 191.9 C 10.4 189.0 8.2 185.4 5.9 182.0 C 2.3 177.3 1.7 171.3 0.0 165.8 L 0.0 154.8 C 1.6 143.8 7.3 133.9 15.2 126.2 C 52.7 88.7 90.2 51.2 127.7 13.6 C 131.4 9.9 136.0 7.2 140.4 4.3 C 144.8 2.1 149.8 1.3 154.6 0.0 Z" />
                    <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 130.9 25.8 C 139.7 17.1 152.6 11.9 165.0 14.1 C 174.7 14.8 183.5 20.1 190.2 26.8 C 224.5 61.2 258.9 95.5 293.2 129.9 C 296.5 134.3 300.4 138.6 302.1 144.0 C 305.2 150.8 305.1 158.6 304.2 165.9 C 303.3 174.4 297.9 181.3 292.4 187.4 C 256.7 223.0 221.0 258.7 185.4 294.4 C 182.8 296.7 179.6 297.9 176.6 299.5 C 171.6 302.5 165.5 302.3 160.0 303.6 C 155.1 302.5 150.1 302.3 145.4 300.5 C 141.5 298.5 137.3 297.0 134.1 293.9 C 99.6 259.3 65.1 224.9 30.6 190.4 C 27.1 187.2 24.3 183.3 21.2 179.6 C 15.0 171.0 14.4 159.9 15.9 149.8 C 17.7 142.0 22.2 135.3 27.3 129.3 C 61.9 94.8 96.3 60.3 130.9 25.8 Z" />
                    <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 164.3 86.4 C 168.8 85.6 174.0 86.2 177.3 89.6 C 181.0 92.9 183.4 98.3 182.0 103.2 C 181.5 108.5 176.9 112.6 172.0 113.9 C 163.1 117.0 152.3 108.4 153.9 98.9 C 155.0 93.4 159.0 88.4 164.3 86.4 Z" />
                    <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 101.1 117.8 C 102.1 114.3 103.3 110.5 106.7 108.6 C 117.2 108.7 127.6 108.7 138.0 108.7 C 140.1 108.6 142.1 109.1 144.1 109.5 C 148.2 116.1 153.2 122.1 157.5 128.6 C 159.7 131.9 161.8 136.1 159.8 140.0 C 154.0 150.7 148.0 161.3 142.3 172.1 C 155.4 181.7 167.5 192.5 180.6 202.0 C 184.4 197.9 189.2 193.4 195.2 194.8 C 197.4 195.6 200.0 195.9 201.6 197.7 C 203.7 200.0 205.5 202.6 206.9 205.4 C 209.0 204.4 211.7 204.0 213.8 205.2 C 217.4 207.5 219.2 211.9 219.3 216.0 C 221.5 217.0 223.3 218.4 224.5 220.4 C 230.1 220.0 234.4 224.1 236.6 228.8 C 211.7 229.0 186.9 228.7 162.0 229.1 C 155.9 228.5 149.7 229.6 143.5 228.7 C 144.8 227.2 145.9 225.5 147.0 223.8 C 149.9 222.5 152.9 221.1 156.2 221.1 C 157.9 220.7 159.6 220.1 158.8 217.9 C 160.5 215.3 162.7 212.4 166.3 213.1 C 168.2 209.3 171.3 206.3 175.0 204.2 C 163.8 195.0 152.5 186.0 141.3 176.8 C 140.8 175.5 139.1 176.4 139.5 177.4 C 142.0 180.1 144.9 183.1 144.7 187.0 C 144.9 189.5 143.1 191.6 142.2 193.8 C 139.3 200.7 135.1 207.1 131.8 213.8 C 129.8 218.0 127.6 222.2 125.2 226.2 C 122.6 228.2 118.7 229.6 115.5 228.1 C 113.5 226.6 112.3 224.3 111.6 222.0 C 113.6 214.7 117.9 208.5 120.7 201.5 C 122.9 196.7 125.4 192.0 127.7 187.3 C 121.8 180.0 116.0 172.6 109.8 165.5 C 109.7 172.9 110.1 180.4 109.7 187.8 C 106.8 199.4 103.6 211.0 100.6 222.7 C 99.7 227.6 92.9 230.3 88.9 227.0 C 85.3 225.1 86.1 220.6 86.3 217.2 C 88.6 207.8 91.0 198.5 93.3 189.1 C 93.7 177.9 93.1 166.7 93.6 155.5 C 93.6 151.0 98.2 149.3 100.4 146.1 C 98.0 145.3 96.3 143.3 96.4 140.8 C 94.1 139.2 92.0 137.3 89.5 136.0 C 88.5 133.9 89.9 132.2 91.8 131.5 C 93.5 133.1 95.4 134.5 97.3 135.7 C 98.6 129.8 99.7 123.8 101.1 117.8 Z" />
                    <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 113.0 123.3 C 116.6 123.4 120.1 123.4 123.6 123.4 C 119.3 128.0 114.4 132.1 110.3 136.9 C 110.8 132.3 112.1 127.9 113.0 123.3 Z" />
                    <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 122.7 156.0 C 128.2 153.5 133.7 151.2 139.2 148.7 C 137.2 153.8 133.8 158.0 131.8 163.0 C 128.6 160.8 125.5 158.6 122.7 156.0 Z" />
                </svg>
                </TabPanel>
            </React.Fragment>
            
        )

    }
    return composant
}
export default Matrix