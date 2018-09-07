import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import { PageLayout } from './PageLayout';

class Faq extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    };

    render() {

        return(
            <PageLayout message={this.props.message}>
                Faq

            </PageLayout>
        );
    }
};

const mapStateToProps = (state) => { return state.AppReducer; };
const mapDispatchToProps = { /** Action_Load_Tx */ };
export default withRouter( connect( mapStateToProps, mapDispatchToProps)(Faq) );