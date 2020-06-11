/* eslint max-len: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default class ViewSelections extends React.Component {
    render() {
        const selections = [];
        this.props.asset.annotations.forEach(function(s, idx) {
            selections.push(
                <div key={idx} className="card w-100 card-selection active">
                    <div className="card-body">
                        <h5 className="card-title">
                            {s.title}
                        </h5>

                        {s.metadata && s.metadata.tags.length > 0 && (
                            <p className="card-text">
                                {s.metadata.tags}
                            </p>
                        )}
                        {s.vocabulary && s.vocabulary.length > 0 && (
                            <p className="card-text">
                                {s.vocabulary}
                            </p>
                        )}
                        {s.metadata && s.metadata.body && (
                            <p className="card-text">
                                {s.metadata.body}
                            </p>
                        )}

                        <a href="#" className="btn btn-secondary btn-sm">Edit</a>&nbsp;
                        <a href="#" className="btn btn-secondary btn-sm">Copy</a>&nbsp;
                        <a href="#" className="btn btn-primary btn-sm disabled">View</a>
                    </div>
                </div>
            );
        });

        return (
            <React.Fragment>
                <h2>
                    Selections from <a href="#">{this.props.asset.title}</a>
                </h2>

                <div className="btn-group">
                    <a
                        className="btn btn-light dropdown-toggle"
                        data-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">Group </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">by author</a>
                        <a className="dropdown-item" href="#">by tag</a>
                    </div>
                </div>
                &nbsp;
                <div className="btn-group">
                    <a
                        className="btn btn-light dropdown-toggle"
                        data-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">Sort </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">in ascending order</a>
                        <a className="dropdown-item" href="#">in descending order</a>
                    </div>
                </div>

                {selections}

                <Modal
                    show={this.props.showDeleteDialogBool}
                    onHide={this.props.hideDeleteDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete annotation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Delete this annotation?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeleteDialog}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={this.onDeleteSelection}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );

    }
}

ViewSelections.propTypes = {
    asset: PropTypes.object,
    onClickPlay: PropTypes.func.isRequired,
    onClickSelection: PropTypes.func.isRequired,
    hideDeleteDialog: PropTypes.func.isRequired,
    showDeleteDialog: PropTypes.func.isRequired,
    showDeleteDialogBool: PropTypes.bool.isRequired
};
