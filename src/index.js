import React from 'react'

import cache from './cache-react-component'

export default cache

export const EasyCacheRouteOfPathName = cache(
  props => props.location.pathname
)(function Route(props) {
  return React.Children.only(props.children)
})

export const EasyCacheRouteOfComponent = cache(
  props => React.Children.only(props.children).type.displayName || React.Children.only(props.children).type.name
)(function Route(props) {
  return React.Children.only(props.children)
})
