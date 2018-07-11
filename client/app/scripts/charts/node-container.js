import React from 'react';
import { Motion } from 'react-motion';

import { GraphNode } from 'weaveworks-ui-components';
import { weakSpring } from 'weaveworks-ui-components/lib/utils/animation';

import { trackAnalyticsEvent } from '../utils/tracking-utils';
import { GRAPH_VIEW_MODE } from '../constants/naming';

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

  transformedNode = (otherProps, { x, y, k }) => (
    <g transform={`translate(${x},${y}) scale(${k})`} ref={this.saveShapeRef}>
      <GraphNode {...otherProps} onClick={this.handleMouseClick} />
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
