import React from 'react'

export default function cache(mapPropsToKey, option) {
  mapPropsToKey = mapPropsToKey || (() => 'NoCache')
  option = option || {}
  // 默认最高5层，1000年
  const {
    count=5,
    expire=3153600000000,

    defaultContainerStyle,
    defaultContainerClassName,
    defaultEnterStyle,
    defaultEnterClassName,
    defaultShowingStyle={display: 'initial'},
    defaultShowingClassName,
    defaultLeaveStyle,
    defaultLeaveClassName,
    defaultHiddenStyle={display: 'none'},
    defaultHiddenClassName,
    defaultLeaveDuration=0,

    beforeInit,
    afterInit,
    beforeSwitch,
    afterSwitch,
  } = option

  return function(ToCacheComponent) {
    class Cached extends React.Component {
      constructor(props) {
        super(props)

        let {
          containerStyle=defaultContainerStyle,
          containerClassName=defaultContainerClassName,
          enterStyle=defaultEnterStyle,
          enterClassName=defaultEnterClassName
        } = beforeInit ? beforeInit({prevProps: props}) : {}

        this.state = {
          items: [{key: mapPropsToKey(props), props}],
          containerStyle,
          containerClassName,
          style_one: enterStyle,
          className_one: enterClassName,
          // style_two: {},
          // className_two: '',
          // style_rest: {},
          // className_rest: '',
        }
      }
      componentDidMount() {
        let {containerStyle:sCS, containerClassName:sCC, style_one:sSO, className_one:sCO, items } = this.state

        let {
          containerStyle = sCS || defaultContainerStyle,
          containerClassName = sCC || defaultContainerClassName,
          showingStyle = sSO || defaultShowingStyle,
          showingClassName = sCO || defaultShowingClassName
        } = afterInit ? afterInit({prevProps: this.props, prevWrapper: this.refs[items[0].key]}) : {}

        this.setState({
          containerStyle,
          containerClassName,
          style_one: showingStyle,
          className_one: showingClassName,
        })
      }
      componentWillReceiveProps(nextProps) {
        let items = this.state.items
        let now = new Date().getTime()
        let nextKey = mapPropsToKey(nextProps)

        items = items.filter(item => !item.expire || item.expire>now)

        this.switching = items[0].key !== nextKey
        this.recover = items.slice(1).filter(item => item.key===nextKey).length > 0
        this.prevProps = this.props
        this.nextProps = nextProps

        items = items.filter(item => item.key!==nextKey)
        items.forEach(item => item.expire = item.expire || now+expire)
        items = [{key: nextKey, props: nextProps}].concat(items).slice(0, count)

        if (this.switching) {
          let {containerStyle: sCS, containerClassName: sCC, style_one: sSO, className_one: sCO, style_two: sST, className_two: sCT, style_rest: sSR, className_rest: sCR } = this.state

          let {
            containerStyle = sCS || defaultContainerStyle,
            containerClassName = sCC || defaultContainerClassName,
            enterStyle = this.recover ? (sSR || defaultEnterStyle) : defaultEnterStyle,
            enterClassName = this.recover ? (sCR || defaultEnterClassName) : defaultEnterClassName,
            showingStyle = sSO || defaultShowingStyle,
            showingClassName = sCO || defaultShowingClassName,
            // leaveStyle = defaultLeaveStyle,
            // leaveClassName = defaultLeaveClassName,
            hiddenStyle = sSR || defaultHiddenStyle,
            hiddenClassName = sCR || defaultHiddenClassName,
          } = beforeSwitch ? beforeSwitch({prevProps: this.prevProps, nextProps: this.nextProps, prevWrapper: this.refs[this.state.items[0].key], nextWrapper: this.refs[nextKey], recover: this.revocer}) : {}

          this.setState({
            containerStyle,
            containerClassName,
            style_one: enterStyle,
            className_one: enterClassName,
            style_two: showingStyle,
            className_two: showingClassName,
            style_rest: hiddenStyle,
            className_rest: hiddenClassName,
          })
        }

        this.setState({items})
      }
      componentDidUpdate(prevProps, prevState) {
        if (this.switching) {
          delete this.switching

          let {containerStyle: sCS, containerClassName: sCC, style_one: sSO, className_one: sCO, style_two: sST, className_two: sCT, style_rest: sSR, className_rest: sCR } = this.state

          let {
            containerStyle = sCS || defaultContainerStyle,
            containerClassName = sCC || defaultContainerClassName,
            // enterStyle = sSR || defaultEnterStyle,
            // enterClassName = sCR || defaultEnterClassName,
            showingStyle = sST || defaultShowingStyle,
            showingClassName = sCT || defaultShowingClassName,
            leaveStyle = defaultLeaveStyle,
            leaveClassName = defaultLeaveClassName,
            hiddenStyle = sSR || defaultHiddenStyle,
            hiddenClassName = sCR || defaultHiddenClassName,
            leaveDuration = defaultLeaveDuration,
          } = afterSwitch ? afterSwitch({prevProps: this.prevProps, nextProps: this.nextProps, prevWrapper: this.refs[this.state.items[1].key], nextWrapper: this.refs[this.state.items[0].key], recover: this.revocer}) : {}

          this.setState({
            containerStyle,
            containerClassName,
            style_one: showingStyle,
            className_one: showingClassName,
            style_two: leaveStyle,
            className_two: leaveClassName,
            style_rest: hiddenStyle,
            className_rest: hiddenClassName,
          })

          this.timeout = setTimeout(() => {
            this.setState({
              style_two: hiddenStyle,
              className_two: hiddenClassName,
            })
          }, leaveDuration);
        }
      }
      componentWillUnmount() {
        clearTimeout(this.timeout)
      }
      render() {
        // 不直接操作 item.props 里的 style 是因为 display 不止有 none、initial 也可能是 flex
        let {containerStyle, containerClassName, style_one, className_one, style_two, className_two, style_rest, className_rest } = this.state
        return (
          <div style={containerStyle} className={containerClassName}>
            {this.state.items.map((item, index) => (
              <div key={item.key} ref={item.key}
                style={index===0 ? style_one : (index===1 ? style_two : style_rest)}
                className={index===0 ? className_one : (index===1 ? className_two : className_rest)}
              >
                {React.createElement(ToCacheComponent, item.props)}
              </div>
            ))}
          </div>
        )
      }
    }

    Cached.displayName = `Cached(${ToCacheComponent.displayName || ToCacheComponent.name || 'Component'})`
    Cached.Component = ToCacheComponent
    return Cached
  }
}
