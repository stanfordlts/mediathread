import React from 'react';
import PropTypes from 'prop-types';

import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import MultiPoint from 'ol/geom/MultiPoint';
import {getCenter} from 'ol/extent';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import {
    Circle as CircleStyle, Fill, Stroke, Style
} from 'ol/style';

import AnnotationScroller from './AnnotationScroller';
import Asset from './Asset';
import {
    capitalizeFirstLetter, handleBrokenImage,
    getCoordStyles, transform
} from './utils';

class Selections extends React.Component {
    render() {
        const annotations = this.props.asset.annotations;
        return (
            <React.Fragment>
                <hr />
                <h6>Selections</h6>
                {annotations.length > 0 && (
                    <AnnotationScroller
                        annotations={annotations}
                        onSelectedAnnotationUpdate={
                            this.props.onSelectedAnnotationUpdate}
                    />
                )}
                {annotations.length <= 0 && (
                    <p className="card-text text-muted">
                        None
                    </p>
                )}
            </React.Fragment>
        );
    }
}

Selections.propTypes = {
    asset: PropTypes.object,
    onSelectedAnnotationUpdate: PropTypes.func.isRequired,
    currentUser: PropTypes.number.isRequired
};

export default class GridAsset extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedAnnotation: null,
            thumbnailUrl: '/media/img/thumb_video.png'
        };

        this.selectionLayer = new VectorLayer({
            source: new VectorSource()
        });

        this.asset = new Asset(this.props.asset);

        this.onSelectedAnnotationUpdate =
            this.onSelectedAnnotationUpdate.bind(this);
    }

    onSelectedAnnotationUpdate(annotation) {
        const type = this.asset.getType();
        const a = this.props.asset.annotations[annotation];

        this.setState({selectedAnnotation: a});

        if (type === 'image') {
            const styles = getCoordStyles();

            this.map.removeLayer(this.selectionLayer);

            const img = this.asset.getImage();
            const geometry = transform(
                a.annotation.geometry,
                img.width, img.height,
                a.annotation.zoom
            );
            const geojsonObject = {
                type: 'FeatureCollection',
                crs: {
                    type: 'name',
                    properties: {
                        name: 'Flatland:1'
                    }
                },
                features: [
                    {
                        type: 'Feature',
                        geometry: geometry
                    }
                ]
            };

            const source = new VectorSource({
                features: new GeoJSON().readFeatures(geojsonObject)
            });

            const newLayer = new VectorLayer({
                source: source,
                style: styles
            });

            this.selectionLayer = newLayer;
            this.map.addLayer(newLayer);

            // Fit the selection in the view
            const feature = source.getFeatures()[0];
            const polygon = feature.getGeometry();
            const view = this.map.getView();
            view.fit(polygon, {padding: [20, 20, 20, 20]});
        }
    }
    render() {
        const type = this.asset.getType();

        let annotationDom = null;
        if (type === 'video' && this.state.selectedAnnotation) {
            annotationDom = (
                <div className="timecode">
                    <span className="badge badge-dark">
                        {this.state.selectedAnnotation.annotation.startCode}
                        &nbsp;-&nbsp;
                        {this.state.selectedAnnotation.annotation.endCode}
                    </span>
                </div>
            );
        }

        let assetLink = '#';
        if (window.MediaThread) {
            const courseId = window.MediaThread.current_course;
            assetLink =
                `/course/${courseId}/react/asset/${this.props.asset.id}/`;
        }

        return (
            <div className="col-sm-4">
                <div className="card" key={this.props.asset.id}>
                    <div className="card-thumbnail">
                        <div className="media-type">
                            <span className="badge badge-light">
                                {capitalizeFirstLetter(type)}
                            </span>
                        </div>
                        <div className="image-overlay">
                            <a
                                href={assetLink}
                                title={this.props.asset.title}>
                                {type === 'image' && (
                                    <div
                                        className={
                                            'ol-map mx-auto d-block img-fluid'
                                        }
                                        id={`map-${this.props.asset.id}`}></div>
                                )}
                                {type === 'video' && (
                                    <img
                                        className="mx-auto d-block img-fluid"
                                        style={{'maxWidth': '100%'}}
                                        alt={'Video thumbnail for: ' +
                                             this.props.asset.title}
                                        src={this.state.thumbnailUrl}
                                        onError={() => handleBrokenImage(type)} />
                                )}
                            </a>
                            {annotationDom}
                        </div>
                    </div>

                    <div className="card-body">
                        <h5 className="card-title">
                            <a
                                onClick={
                                    this.props.toggleAssetView.bind(
                                        this, this.props.asset)}
                                href={assetLink}
                                title={this.props.asset.title}
                                dangerouslySetInnerHTML={{
                                    __html: this.props.asset.title
                                }}>
                            </a>
                        </h5>
                        <Selections
                            asset={this.props.asset}
                            onSelectedAnnotationUpdate={
                                this.onSelectedAnnotationUpdate}
                            currentUser={this.props.currentUser} />
                    </div>

                </div>
            </div>
        );
    }
    componentDidMount() {
        let thumbnail = this.asset.getThumbnail();
        if (typeof thumbnail === 'string') {
            this.setState({thumbnailUrl: this.asset.getThumbnail()});
        } else if (thumbnail.then) {
            const me = this;
            this.asset.getThumbnail().then(function(url) {
                me.setState({thumbnailUrl: url});
            });
        }

        if (this.asset.getType() === 'image') {
            const img = this.asset.getImage();

            const extent = [
                0, 0,
                img.width, img.height
            ];

            const projection = new Projection({
                code: 'Flatland:1',
                units: 'pixels',
                extent: extent
            });

            this.map = new Map({
                target: `map-${this.props.asset.id}`,
                controls: [],
                interactions: [],
                layers: [
                    new ImageLayer({
                        source: new Static({
                            url: img.url,
                            projection: projection,
                            imageExtent: extent
                        })
                    })
                ],
                view: new View({
                    projection: projection,
                    center: getCenter(extent),
                    zoom: 0.5
                })
            });
        }
    }
}

GridAsset.propTypes = {
    asset: PropTypes.object.isRequired,
    currentUser: PropTypes.number.isRequired,
    toggleAssetView: PropTypes.func.isRequired
};
