import React from 'react';
import { Motion } from 'react-motion';
import { List as makeList } from 'immutable';

import { GraphNode } from 'weaveworks-ui-components';
import { weakSpring } from 'weaveworks-ui-components/lib/utils/animation';

import { trackAnalyticsEvent } from '../utils/tracking-utils';
import MatchedResults from '../components/matched-results';
import { GRAPH_VIEW_MODE } from '../constants/naming';

import NodeNetworksOverlay from './node-networks-overlay';

export default class NodeContainer extends React.PureComponent {
  handleMouseClick = (nodeId, ev) => {
    ev.stopPropagation();

    trackAnalyticsEvent('scope.node.click', {
      layout: GRAPH_VIEW_MODE,
      topologyId: this.props.currentTopology.get('id'),
      parentTopologyId: this.props.currentTopology.get('parentId'),
    });

    this.props.onClick(this.props.id, this.props.label, this.shapeRef.getBoundingClientRect());
  };

  saveShapeRef = (ref) => {
    this.shapeRef = ref;
  };

  renderPrependedInfo = () => {
    if (!this.props.showingNetworks) return null;

    return (
      <NodeNetworksOverlay
        networks={this.props.networks}
        stack={this.props.stacked}
      />
    );
  }

  renderAppendedInfo = () => {
    const matchedMetadata = this.props.matches.get('metadata', makeList());
    const matchedParents = this.props.matches.get('parents', makeList());
    const matchedNodeDetails = matchedMetadata.concat(matchedParents);

    return <MatchedResults matches={matchedNodeDetails} />;
  }

  transformedNode = (otherProps, { x, y, k }) => (
    <g transform={`translate(${x},${y}) scale(${k})`} ref={this.saveShapeRef}>
      <GraphNode
        {...otherProps}
        renderPrependedInfo={this.renderPrependedInfo}
        renderAppendedInfo={this.renderAppendedInfo}
        onClick={this.handleMouseClick}
      />
    </g>
  );

  render() {
    const {
      dx, dy, isAnimated, scale, ...forwardedProps
    } = this.props;

    if (!isAnimated) {
      // Show static node for optimized rendering
      return this.transformedNode(forwardedProps, { x: dx, y: dy, k: scale });
    }

    return (
      // Animate the node if the layout is sufficiently small
      <Motion style={{ x: weakSpring(dx), y: weakSpring(dy), k: weakSpring(scale) }}>
        {interpolated => this.transformedNode(forwardedProps, interpolated)}
      </Motion>
    );
  }
}
