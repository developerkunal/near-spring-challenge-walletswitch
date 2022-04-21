import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import SignIn from './components/SignIn';
import Messages from './components/Messages';
import './App.css'

import { providers, utils } from 'near-api-js';

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([]);
  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true);

  const selector = window.selector;

  var today = new Date();

  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  
  var dateTime = date+' '+time;

  if (window.accountId == '') {
    selector.getAccounts().then((value) => {
      window.accountId = value[0].accountId;
    });
  }


  const get_account = async () => {
    if (window.accountId == '') {
      return null;
    }

    const { nodeUrl } = selector.network;
    const provider = new providers.JsonRpcProvider({ url: nodeUrl });

    return provider.query({
      request_type: "view_account",
      finality: "final",
      account_id: window.accountId,
    }).then((data) => ({
      ...data,
      account_id: window.accountId,
    }));
  }

  useEffect(() => {
    setLoading(true);

    get_account().then((value) => {
      window.account = value;
      setAccount(value);
      setLoading(false);
    });
  }, []);
  const get_messages = () => {
    const provider = new providers.JsonRpcProvider({
      url: selector.network.nodeUrl,
    });

    return provider.query({
      request_type: "call_function",
      account_id: selector.getContractId(),
      method_name: "getMessages",
      args_base64: "",
      finality: "optimistic",
    }).then((res) => {
      return JSON.parse(Buffer.from(res.result).toString())
    }).catch((err) => console.error(err));
  }

  useEffect(() => {
    get_messages().then(setMessages);
  }, []);

  window.get_messages = get_messages;

  console.log(typeof(date))
  const onSubmit = (e) => {
    e.preventDefault();

    const { fieldset, message, donation } = e.target.elements;

    fieldset.disabled = true;

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    selector.signAndSendTransaction({
      signerId: window.accountId,
      actions: [{
        type: "FunctionCall",
        params: {
          methodName: "addMessage",
          args: {
             text: message.value,
             timedate:dateTime,
          },
          gas: BOATLOAD_OF_GAS,
          deposit: utils.format.parseNearAmount(donation.value || '0'),
        },
      },],
    }).catch((err) => {
      alert("Failed to add message");
      throw err;
    }).then(() => {
      return get_messages().then(messages => {
        setMessages(messages);
        message.value = '';
        donation.value = SUGGESTED_DONATION;
        fieldset.disabled = false;
        message.focus();
      }).catch((err) => {
        alert("Failed to refresh messsages.");
        throw err;
      });
    }).catch((err) => {
      console.error(err);
      fieldset.disabled = false;
    });
  };

  const signIn = () => {
    selector.show()
    
  };

  const signOut = () => {
    selector.signOut().catch((err) => {
      console.log("Failed to sign out.");
      alert('Failed to sign out.');
    });
    window.accountId = '';
  };

  if (loading) {
    return null;
  }
  return (
    <main>
      <header>
        <h1>NEAR Guest Book</h1>
        { selector.isSignedIn()
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      { selector.isSignedIn()
        ? <Form 
            onSubmit={onSubmit} 
          />
        : <SignIn/>
      }
      { !!selector.isSignedIn() && 
        !!messages.length && 
        <Messages messages={messages}/> }
    </main>
  );
};


App.propTypes = {
  // contract: PropTypes.shape({
  //   add_message: PropTypes.func.isRequired,
  //   get_messages: PropTypes.func.isRequired
  // }).isRequired,
  // currentUser: PropTypes.shape({
  //   accountId: PropTypes.string.isRequired,
  //   balance: PropTypes.string.isRequired
  // }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  // wallet: PropTypes.shape({
  //   requestSignIn: PropTypes.func.isRequired,
  //   signOut: PropTypes.func.isRequired
  // }).isRequired
};

export default App;
