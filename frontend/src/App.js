import React from 'react';
import { Switch, Route, Redirect, withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SharedropTools from './components/SharedropTools'
import Faq from './components/Faq'

import './assets/css/paper-kit.css';
import './assets/css/demo.css';
import './assets/css/nucleo-icons.css';
import './assets/css/override.css';

const Header = () => (
    <nav className="navbar navbar-expand-lg bg-dark">
        <div className="container">
            {/*<div className="navbar-translate">*/}
                {/*<Link className="navbar-brand" to="/listing">anonacc</Link>*/}
                {/*<button className="navbar-toggler navbar-toggler-right navbar-burger" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">*/}
                    {/*<span className="navbar-toggler-bar"></span><span className="navbar-toggler-bar"></span><span className="navbar-toggler-bar"></span>*/}
                {/*</button>*/}
                <Link className="navbar-brand" to="/">
                    {/*<i className="fa fa-user-secret" aria-hidden="true" style={{opacity: .7}}></i>*/}
                    WLS.Sharedrop</Link>
            {/*</div>*/}
            {/*<div className="collapse navbar-collapse" id="navbarToggler">*/}
                <ul className="navbar-nav ml-auto" style={{flexDirection: 'row'}}>
                    {/*<li className="nav-item"><Link to="/anonacc" className="nav-link"><i className="fa fa-user-secret" aria-hidden="true" style={{opacity: .3}}></i> Create</Link></li>*/}
                    <li className="nav-item"><Link to="/faq" className="nav-link">Faq</Link></li>
                </ul>
            {/*</div>*/}
        </div>
    </nav>
);

const Footer = () => (
    <footer className="footer footer-black">
        <div className="container">
            <div className="row">
                <nav className="footer-nav">
                    <ul>
                        <li><a href="###" target="_blank" rel="noopener noreferrer">Blog</a></li>
                        <li><a href="###" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                        <li><a href="###" target="_blank" rel="noopener noreferrer">Reddit</a></li>
                    </ul>
                </nav>
                <div className="credits ml-auto"><span className="copyright">Brought to you by BeyondBitcoin</span></div>
            </div>
        </div>
    </footer>
);

export class App extends React.Component {
    render() {
        return (
            <div>
                <Header />

                <div className="wrapper">

                    <Switch>
                        <Route name="Index" path="/" exact render={() => <Redirect to="/sharedroptools" /> } />
                        <Route name="SharedropTools" path="/sharedroptools" component={SharedropTools} />
                        <Route name="Faq" path="/faq" component={Faq} />
                    </Switch>

                    <div className="subscribe-line subscribe-line-transparent" style={{backgroundImage: "url('/assets/img/bg.jpg')", backgroundAttachment: "fixed"}}>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-9 col-sm-8">
                                    <h4 className="mt-1 font-weight-bold title-uppercase text-info shadow5">Check out Whaleshares on its own chain...</h4>
                                </div>
                                <div className="col-md-3 col-sm-4"><a href="https://whaleshares.io/" target="_blank" rel="noopener noreferrer" className="btn btn-neutral btn-block btn-round">Visit Now!</a></div>
                            </div>
                        </div>
                    </div>
                    {/*<div className="separator"></div>*/}
                    
                    <Footer />

                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => { return state.AppReducer; };
const mapDispatchToProps = { };
export default withRouter( connect( mapStateToProps, mapDispatchToProps)(App) );