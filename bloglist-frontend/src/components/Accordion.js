import { Button } from '@mui/material';
import { useState } from 'react';

const Accordion = (props) => {
  const [active, setActive] = useState(false);

  const showWhenVisible = { display: active ? '' : 'none' };

  const toggleVisibility = () => {
    setActive(!active);
  };

  return (
    <div
      className="accordion"
      style={{
        border: '1px solid #0284c7',
        borderRadius: 5,
        padding: '5px 15px',
      }}
    >
      {/* Title and Toggle Button */}
      <div style={{ display: 'flex' }}>
        <Button
          id="toggle-button"
          onClick={toggleVisibility}
          variant="outlined"
          style={{ alignSelf: 'center', marginRight: 5 }}
        >
          {active ? 'hide' : 'show'}
        </Button>
        <h3>{props.title}</h3>
      </div>

      {/* Content */}
      <div style={showWhenVisible} className="togglableContent">
        {props.children}
      </div>
    </div>
  );
};

export default Accordion;
