import React, { Component, RefObject } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import './abilitydisplay.css';

interface AbilityDisplayProps {
    note: string,
    ability: number,
    confidence: number,
    delta: number
}

class AbilityDisplay extends Component<AbilityDisplayProps> {

    render() {
        return (
        
            <div>
                <Card className="AbilityCard">
                    <div className="Details">
                        <CardContent className="Content">
                            <div style={{flexDirection: "row", display: 'flex', justifyContent: 'space-evenly'}}>
                                <div>
                                    <Typography variant='button' color="textSecondary">
                                        Note
                                    </Typography>
                                    <Typography variant='h6' style={{textAlign: 'center'}}>
                                        {this.props.note}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant='button' color="textSecondary">
                                        Level
                                    </Typography>
                                    <Typography variant="h6" style={{textAlign: 'center'}}>
                                        {this.props.ability}
                                    </Typography>
                                </div>
                                <Typography align='center' variant="h6" color={this.props.delta < 0 ? 'error' : this.props.delta === 0 ? 'textSecondary' : 'textPrimary'}>
                                    {this.props.delta <= 0 ? this.props.delta : '+' + this.props.delta}
                                </Typography>

                            </div>
                            <ProgressBar percentage={this.props.confidence/20 * 100} />

                        </CardContent>
                    </div>
                </Card>
            </div>

        )
    }
}

interface ProgressBarProps {
    percentage: number
}

const ProgressBar = (props: ProgressBarProps) => {
    return (
    <div className="progress-bar">
        <Filler percentage={props.percentage} />
    </div>
    )
}

const Filler = (props: ProgressBarProps) => {
    return <div className="filler" style={{ width: `${props.percentage}%` }} />
}


export default AbilityDisplay;