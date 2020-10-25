import React, {Component} from "react";
import {Bar} from "react-chartjs-2";
import css from "./frequencyDiagram.module.css";

export default class FrequencyDiagram extends Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: {
                labels: props.params,
                datasets: [
                    {
                        label: props.label,
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: props.data
                    }
                ]
            }
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }


    render() {
        return (
            <>
                <div className={css.graph}>
                    <Bar
                        data={this.state.graph}
                        options={{
                            maintainAspectRatio: false
                        }}
                    />
                </div>
            </>);
    }
}