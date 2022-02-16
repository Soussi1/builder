import Country from './Country/Country.jsx';
import Region from './Region/Region.jsx';
import Matrix from './Matrix/Matrix.jsx'
import Detail from './Detail/Detail.jsx'

const Routes = (React, Router, Material, Dashboard, grafone,libs) => {

    const composant = props =>{

        
        const Ctry = Country(React, Router, Material, Dashboard, grafone,libs)
        const Rgn = Region(React, Router, Material, Dashboard, grafone,libs)
        const Mtrx = Matrix(React, Router, Material, Dashboard, grafone,libs)
        const Det = Detail(React, Router, Material, Dashboard, grafone,libs)
        
        // let mainPath = '/dashboard/'+Dashboard.id+'/France'
        // let routepath = '/dashboard/'+Dashboard.id+'/France/'
        let mainPath = '/dashboard/'+Dashboard.id
        let routepath = '/dashboard/'+Dashboard.id+'/'
        console.log(Dashboard);
        
        return(
            <div>
                <Router.BrowserRouter>
                    
                    {/* <Router.Redirect exact push to={mainPath} /> */}
                    <Router.Route path={mainPath} exact component={Ctry}/>
                    <Router.Route path={routepath+':regionName'} exact component={Rgn}/>
                    <Router.Route path={routepath+':regionName/:siteTrig'} exact component={Mtrx}/>
                    <Router.Route path={routepath+':regionName/:siteTrig/:clusterName'} exact component={Det}/>
                </Router.BrowserRouter>
            </div>
        )

    }
    return composant
}
export default Routes