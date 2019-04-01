import React, { Component } from 'react';
import { Collapse } from 'react-bootstrap';

class Section extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
    }
    render() {
        return (
            <>
            <h4 onClick={() => this.setState({ open: !this.state.open })}
            aria-controls="example-collapse-text"
            aria-expanded={this.state.open} className="text-info">{this.props.icon} {this.props.sectionTitle}</h4>
            <Collapse in={this.state.open}>
                {this.props.children}
            </Collapse>
            <hr />
            </>
        );
    }
}

export default Section;