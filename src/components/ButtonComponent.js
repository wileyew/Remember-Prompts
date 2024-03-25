// ButtonComponent.js
import React, { useEffect } from "react";

const ButtonComponent = ({ mode, user }) => {
  useEffect(() => {
    const handleClick = () => {
      setTimeout(() => {
        window.botpressWebChat.sendPayload({
          type: 'text',
          text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
        });
      }, 2000);
    };

    const btnConvoAdd = document.getElementById('btn-convo-add');
    if (btnConvoAdd) {
      
      btnConvoAdd.addEventListener('click', handleClick);
    }

    return () => {
      if (btnConvoAdd) {
        btnConvoAdd.removeEventListener('click', handleClick);
      }
    };
  }, [user]); 

  return null; 
};

export default ButtonComponent;
