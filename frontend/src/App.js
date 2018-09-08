import React from 'react';
import { Switch, Route, Redirect, withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import CoinSwapTool from './components/CoinSwapTool'
import Faq from './components/Faq'

import './assets/css/paper-kit.css';
import './assets/css/demo.css';
import './assets/css/nucleo-icons.css';
import './assets/css/override.css';

const Header = () => (
    <nav className="navbar navbar-expand-lg">
        <div className="container">
            <Link className="navbar-brand" to="/">
                <img src="https://d33wubrfki0l68.cloudfront.net/ac8889e430299133ac5b8c2cd6963794aa05af0d/588b4/graphics/smoke_user.png" alt="smoke logo"/> Bitshares Claim Tool</Link>
            {/*<ul className="navbar-nav ml-auto" style={{flexDirection: 'row'}}>*/}
                {/*<li className="nav-item"><Link to="/faq" className="nav-link">Faq</Link></li>*/}
            {/*</ul>*/}
            <a href="https://smoke.io" class="btn btn-success">Back to Smoke.io</a>
        </div>
    </nav>
);

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="row">

                <div className="credits ml-auto"><span className="copyright">© 2018 Smoke.Network</span></div>
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
                        <Route name="Index" path="/" exact render={() => <Redirect to="/coinswaptool" /> } />
                        <Route name="CoinSwapTool" path="/coinswaptool" component={CoinSwapTool} />
                        <Route name="Faq" path="/faq" component={Faq} />
                    </Switch>

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
