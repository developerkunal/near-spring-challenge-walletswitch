import React from 'react';
import PropTypes from 'prop-types';

export default function Messages({ messages }) {
  return (
    <>
      <h2>Messages</h2>
      {messages.map((message, i) =>
        // TODO: format as cards, add timestamp
       
        <div key={i} >

          <div className="container">
            
  <div className="arrow" >
    <div className="outer" ></div>
    <div className="inner" ></div>
  </div>
  
  <div className="message-body" style={{'backgroundColor': message.premium ? '#7676ff' : ''}}>
  {message.premium ? <p>Premium</p> : ''}
  <strong>{message.sender}</strong>:<br/>
  <p>Time :{message.timedate}</p>

    <p>{message.text}</p>
  </div>
  
</div>

        </div>
      )}
    </>
  );
}

Messages.propTypes = {
  messages: PropTypes.array
};
