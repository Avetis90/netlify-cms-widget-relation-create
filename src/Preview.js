import React from 'react';
import PropTypes from 'prop-types';
import { WidgetPreviewContainer } from 'netlify-cms-ui-default';

function RelationCreatePreview({ value }) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

RelationCreatePreview.propTypes = {
  value: PropTypes.node,
};

export default RelationCreatePreview;
