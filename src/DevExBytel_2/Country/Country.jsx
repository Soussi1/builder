require('../Styles/common.css')
const Country = (React, Router, Material, Dashboard, grafone,libs) =>{

    const composant = props =>{
        let valpage=0
        if(props.location.search===""){
            valpage=0
        }
        else{
            valpage=parseInt(props.location.search.split('?')[1])
        }
        // console.log('props.location.search');
        // console.log(props);
        const [state, setState] = React.useState([]);
        const [value, setValue] = React.useState(valpage);
        const [clusters,setClusters] = React.useState([])
        const history = Router.useHistory();

        const dataMap = {"type": "FeatureCollection","features":[]}

        const center = [2.5,47]

        const event = new Date();
        const dateNow = 'Dernière mise à jour : ' + event.toLocaleString();

        const region="Île-de-France"

        const bounds = [-200, 85, 200, -60];

        const { search } = window.location;
        const query = new URLSearchParams(search).get('s');
        const [searchQuery, setSearchQuery] = React.useState(query || '');

        console.log(Dashboard.config.sql[1]);

        React.useEffect(() => {
            if(value===0){
                getClusters("performance")
            }
            else if(value===1){
                getClusters("capacity")
            }
            else if(value===2){
                getClusters("FORECAST")
            }
            getCountry()
        },[])

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
                .then((json) => setState(json.response.results.A.tables[0].rows))
        }

        function getClusters(type){
            if(type==="FORECAST"){
                let req="select lmf.resource_name, max(concat(c.level,':',c.hexcode)) as color, s.trigramme, lmf.resource_id from bytel_meteo.last_metric_forecast lmf inner join bytel_meteo.color c on lmf.color=c.name inner join bytel_meteo.link l on lmf.resource_id=l.cluster_id inner join bytel_meteo.site s on l.site_id=s.site_id inner join bytel_meteo.metric_definition md on lmf.metric_key=md.metric_key where md.type = '"+type+"' group by lmf.resource_name,l.site_id,s.name,s.trigramme, lmf.resource_id order by color desc;   "
                grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setClusters(json.response.results.A.tables[0].rows))
            }
            else{
                let req="select lmc.resource_name, max(concat(c.level,':',c.hexcode)) as color, s.trigramme, lmc.resource_id from bytel_meteo.last_metric_cluster lmc inner join bytel_meteo.color c on lmc.color=c.name inner join bytel_meteo.link l on lmc.resource_id=l.cluster_id inner join bytel_meteo.site s on l.site_id=s.site_id inner join bytel_meteo.metric_definition md on lmc.metric_key=md.metric_key where md.type = '"+type+"' group by lmc.resource_name,l.site_id,s.name,s.trigramme, lmc.resource_id order by color desc;   "
                grafone.post('grafana',
                {
                    methode: 'POST',
                    path: `tsdb/query`,
                    body: 
                    {
                        "queries": [{ "datasourceId": parseInt(Dashboard.datasources[0]), "rawSql":req, "format": "table"}]
                    }
                }).then((response) => response.json())
                .then((json) => setClusters(json.response.results.A.tables[0].rows))
            }
        }

        state.map(function(elem){
            dataMap.features.push(JSON.parse(elem[0]))
        })
        
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

        const handleClick = (arg) => {
            if(arg.target!==undefined){
                const regionName = arg.target.attribute('nom')
                
                let path = '/dashboard/'+Dashboard.id+'/'+regionName+'?'+value
                history.push(path)
            }   
        }

        let k= 0
        dataMap.features.map(function(elem){
            if(clusters[0]!==undefined){
                if(elem.properties.nom===region){
                    elem.properties.color=(clusters[0])[1].split(":")[1]
                }
            }
            k=k+1
        })

        //Tabs Material UI
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

        const MyMap = React.useCallback(({mapdata})=>{
            return(
                <libs.DevExVectorMap
                id="vector-map"
                bounds={bounds}
                zoomFactor={25}
                center={center}
                onClick={handleClick}
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

        console.log(dataMap);

        return(
            <React.Fragment>
                <Material.Paper elevation={2} className="title">
                    <div className={'navigationShip'}>
                        <p style={{ display: 'inline' }}>{dateNow}</p>
                    </div>
                </Material.Paper>
                <Material.AppBar position="static" color="default">
                            <Material.Tabs value={value} onChange={handleChange} >
                                <Material.Tab label="Performance" {...a11yProps(0)} onClick={() => getClusters("performance")}/>
                                <Material.Tab label="Capacité" {...a11yProps(1)} onClick={() => getClusters("capacity")}/>
                                <Material.Tab label="Forecast" {...a11yProps(3)} onClick={() => getClusters("FORECAST")} />
                                <Material.Tab label="Conformité" {...a11yProps(2)} />
                            </Material.Tabs>
                </Material.AppBar>
                <TabPanel value={value} index={0}>
                    <Material.Grid container spacing={3}>
                        <Material.Grid item xs={3}>
                        <input value={searchQuery} onInput={e => setSearchQuery(e.target.value)} type="text" id="header-search" placeholder="Search ..." name="s" />
                        <div className='list'>
                            {clusters.map(function(row){
                                return(
                                    // {'/dashboard/'+Dashboard.id+'/France/'+region+'/'+row[2]+'/'+row[0]}
                                    <Router.Link to={'/dashboard/'+Dashboard.id+'/'+region+'/'+row[2]+'/'+row[0]+'?'+value+'?'+row[3]}>
                                        <Material.ListItem button style={{ height: '25px', padding: '25px', color:'#0a0a0a'}}>
                                            <i className={'chip_good'} style={{ background: row[1].split(':')[1] }}></i>
                                            <Material.ListItemText primary={row[0]} />
                                        </Material.ListItem>
                                    </Router.Link>
                                )
                            })}
                        </div>
                        </Material.Grid>
                        <Material.Grid item xs={9}>
                            <MyMap mapdata={dataMap}/>
                        </Material.Grid>
                    </Material.Grid>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Material.Grid container spacing={3}>
                        <Material.Grid item xs={3}>
                        <div className='list'>
                            {clusters.map(function(row){
                                return(
                                    // {'/dashboard/'+Dashboard.id+'/France/'+region+'/'+row[2]+'/'+row[0]}
                                    <Router.Link to={'/dashboard/'+Dashboard.id+'/'+region+'/'+row[2]+'/'+row[0]+'?'+value+'?'+row[3]}>
                                        <Material.ListItem button style={{ height: '25px', padding: '25px',color:'#0a0a0a' }}>
                                            <i className={'chip_good'} style={{ background: row[1].split(':')[1] }}></i>
                                            <Material.ListItemText primary={row[0]} />
                                        </Material.ListItem>
                                    </Router.Link>
                                )
                            })}
                        </div>
                        </Material.Grid>
                        <Material.Grid item xs={9}>
                            
                            <MyMap mapdata={dataMap}/>
                        </Material.Grid>
                    </Material.Grid>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <Material.Grid container spacing={3}>
                        <Material.Grid item xs={3}>
                        <input value={searchQuery} onInput={e => setSearchQuery(e.target.value)} type="text" id="header-search" placeholder="Search ..." name="s" />
                        <div className='list'>
                            {clusters.map(function(row){
                                return(
                                    // {'/dashboard/'+Dashboard.id+'/France/'+region+'/'+row[2]+'/'+row[0]}
                                    <Router.Link to={'/dashboard/'+Dashboard.id+'/'+region+'/'+row[2]+'/'+row[0]+'?'+value+'?'+row[3]}>
                                        <Material.ListItem button style={{ height: '25px', padding: '25px', color:'#0a0a0a'}}>
                                            <i className={'chip_good'} style={{ background: row[1].split(':')[1] }}></i>
                                            <Material.ListItemText primary={row[0]} />
                                        </Material.ListItem>
                                    </Router.Link>
                                )
                            })}
                        </div>
                        </Material.Grid>
                        <Material.Grid item xs={9}>
                            <MyMap mapdata={dataMap}/>
                        </Material.Grid>
                    </Material.Grid>
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <Material.Grid container >
                    <svg width="150pt" height="150pt" viewBox="0 0 320 320" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '6%',marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                        <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 154.6 0.0 L 165.2 0.0 C 171.0 1.5 177.3 2.3 182.1 6.0 C 185.6 8.3 189.3 10.6 192.3 13.6 C 230.1 51.5 268.0 89.3 305.9 127.2 C 313.2 134.7 318.4 144.3 320.0 154.7 L 320.0 165.8 C 318.7 170.3 317.9 174.9 315.9 179.1 C 312.8 183.9 309.9 188.9 305.8 192.8 C 268.3 230.4 230.7 267.9 193.2 305.5 C 185.6 313.0 176.0 318.4 165.4 320.0 L 154.7 320.0 C 144.3 318.4 134.8 313.2 127.3 306.0 C 89.3 267.9 51.3 230.0 13.3 191.9 C 10.4 189.0 8.2 185.4 5.9 182.0 C 2.3 177.3 1.7 171.3 0.0 165.8 L 0.0 154.8 C 1.6 143.8 7.3 133.9 15.2 126.2 C 52.7 88.7 90.2 51.2 127.7 13.6 C 131.4 9.9 136.0 7.2 140.4 4.3 C 144.8 2.1 149.8 1.3 154.6 0.0 Z" />
                        <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 130.9 25.8 C 139.7 17.1 152.6 11.9 165.0 14.1 C 174.7 14.8 183.5 20.1 190.2 26.8 C 224.5 61.2 258.9 95.5 293.2 129.9 C 296.5 134.3 300.4 138.6 302.1 144.0 C 305.2 150.8 305.1 158.6 304.2 165.9 C 303.3 174.4 297.9 181.3 292.4 187.4 C 256.7 223.0 221.0 258.7 185.4 294.4 C 182.8 296.7 179.6 297.9 176.6 299.5 C 171.6 302.5 165.5 302.3 160.0 303.6 C 155.1 302.5 150.1 302.3 145.4 300.5 C 141.5 298.5 137.3 297.0 134.1 293.9 C 99.6 259.3 65.1 224.9 30.6 190.4 C 27.1 187.2 24.3 183.3 21.2 179.6 C 15.0 171.0 14.4 159.9 15.9 149.8 C 17.7 142.0 22.2 135.3 27.3 129.3 C 61.9 94.8 96.3 60.3 130.9 25.8 Z" />
                        <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 164.3 86.4 C 168.8 85.6 174.0 86.2 177.3 89.6 C 181.0 92.9 183.4 98.3 182.0 103.2 C 181.5 108.5 176.9 112.6 172.0 113.9 C 163.1 117.0 152.3 108.4 153.9 98.9 C 155.0 93.4 159.0 88.4 164.3 86.4 Z" />
                        <path fill="#010102" stroke="#010102" stroke-width="0.09375" d=" M 101.1 117.8 C 102.1 114.3 103.3 110.5 106.7 108.6 C 117.2 108.7 127.6 108.7 138.0 108.7 C 140.1 108.6 142.1 109.1 144.1 109.5 C 148.2 116.1 153.2 122.1 157.5 128.6 C 159.7 131.9 161.8 136.1 159.8 140.0 C 154.0 150.7 148.0 161.3 142.3 172.1 C 155.4 181.7 167.5 192.5 180.6 202.0 C 184.4 197.9 189.2 193.4 195.2 194.8 C 197.4 195.6 200.0 195.9 201.6 197.7 C 203.7 200.0 205.5 202.6 206.9 205.4 C 209.0 204.4 211.7 204.0 213.8 205.2 C 217.4 207.5 219.2 211.9 219.3 216.0 C 221.5 217.0 223.3 218.4 224.5 220.4 C 230.1 220.0 234.4 224.1 236.6 228.8 C 211.7 229.0 186.9 228.7 162.0 229.1 C 155.9 228.5 149.7 229.6 143.5 228.7 C 144.8 227.2 145.9 225.5 147.0 223.8 C 149.9 222.5 152.9 221.1 156.2 221.1 C 157.9 220.7 159.6 220.1 158.8 217.9 C 160.5 215.3 162.7 212.4 166.3 213.1 C 168.2 209.3 171.3 206.3 175.0 204.2 C 163.8 195.0 152.5 186.0 141.3 176.8 C 140.8 175.5 139.1 176.4 139.5 177.4 C 142.0 180.1 144.9 183.1 144.7 187.0 C 144.9 189.5 143.1 191.6 142.2 193.8 C 139.3 200.7 135.1 207.1 131.8 213.8 C 129.8 218.0 127.6 222.2 125.2 226.2 C 122.6 228.2 118.7 229.6 115.5 228.1 C 113.5 226.6 112.3 224.3 111.6 222.0 C 113.6 214.7 117.9 208.5 120.7 201.5 C 122.9 196.7 125.4 192.0 127.7 187.3 C 121.8 180.0 116.0 172.6 109.8 165.5 C 109.7 172.9 110.1 180.4 109.7 187.8 C 106.8 199.4 103.6 211.0 100.6 222.7 C 99.7 227.6 92.9 230.3 88.9 227.0 C 85.3 225.1 86.1 220.6 86.3 217.2 C 88.6 207.8 91.0 198.5 93.3 189.1 C 93.7 177.9 93.1 166.7 93.6 155.5 C 93.6 151.0 98.2 149.3 100.4 146.1 C 98.0 145.3 96.3 143.3 96.4 140.8 C 94.1 139.2 92.0 137.3 89.5 136.0 C 88.5 133.9 89.9 132.2 91.8 131.5 C 93.5 133.1 95.4 134.5 97.3 135.7 C 98.6 129.8 99.7 123.8 101.1 117.8 Z" />
                        <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 113.0 123.3 C 116.6 123.4 120.1 123.4 123.6 123.4 C 119.3 128.0 114.4 132.1 110.3 136.9 C 110.8 132.3 112.1 127.9 113.0 123.3 Z" />
                        <path fill="#ffff02" stroke="#ffff02" stroke-width="0.09375" d=" M 122.7 156.0 C 128.2 153.5 133.7 151.2 139.2 148.7 C 137.2 153.8 133.8 158.0 131.8 163.0 C 128.6 160.8 125.5 158.6 122.7 156.0 Z" />
                    </svg>
                    </Material.Grid>
                </TabPanel>
            </React.Fragment>
        )

    }
    return composant
}
export default Country