import React from 'react';
import PropTypes from 'prop-types';
import DataTable from 'react-data-table-component';
import NoAssetsFound from './NoAssetsFound';

export default class CollectionListView extends React.Component {
    render() {
        if (this.props.assetList.length === 0) {
            return <NoAssetsFound />;
        } else {
            const columns = [
                {
                    name: 'Item Title',
                    selector: 'title',
                    sortable: true
                },
                {
                    name: 'Item Type',
                    selector: 'primary_type',
                    sortable: true
                },
                {
                    name: 'Item Owner',
                    selector: 'author.public_name',
                    sortable: true
                },
                {
                    name: 'Item Date',
                    selector: 'modified',
                    sortable: true
                }
            ];
            return (
                <DataTable
                    title="Assets"
                    columns={columns}
                    data={this.props.assetList} />
            );
        }
    }
}

CollectionListView.propTypes = {
    assetList: PropTypes.array
};
