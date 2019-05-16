import React from 'react';
import resizable from './resizable';

class Resizer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.rootRef = React.createRef();
  }

  componentDidMount() {
    const element = this.rootRef.current;
    const { props } = this;
    
    resizable({
      element,
      ...props
    })
  }

  render() {
    return (
      <div ref={this.rootRef} style={{background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAADAQMAAABCowZuAAAABlBMVEUAAACkvtSA7tmIAAAAAXRSTlMAQObYZgAAAA9JREFUCB1jXMUABoxAGgAJaAFXPIkJqAAAAABJRU5ErkJggg==) no-repeat center center', backgroundColor: 'white'}}>
        <div style={{position: 'relative', height: '100%', width: '100%', border: '1px dotted #ebebeb'}} />
      </div>
    );
  }
}

export default Resizer;