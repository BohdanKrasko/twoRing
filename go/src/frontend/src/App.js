// App.js
import React, { Component } from "react";
import "./App.css";
import { 
	BrowserRouter as Router,
	Route} from 'react-router-dom';
import AppForm from './components/Pages/EnterRoom/EnterRoom'
import Magic from './components/Pages/Magic/Magic'

class App extends Component {
	render() {
		return (
		
			<Router >
				<Route exact path='/' component={AppForm}/>
				<Route exact path='/:roomName/magic' component={Magic}/>
			</Router>
			
		)
	}
}

export default App;