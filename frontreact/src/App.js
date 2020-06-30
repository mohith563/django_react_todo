import React from 'react';
import './App.css';

class App extends React.Component{
	constructor(props){
		super(props)
		this.state ={
			todoList:[],
			activeItem:{
				id:null,
				title:'',
				completed:false
			},
			editing:false
		}
	}

	UNSAFE_componentWillMount(){
		this.fetchTasks()
	}

	fetchTasks = () => {
		fetch('http://127.0.0.1:8000/api/task-list/')
		.then(response => response.json())
		.then(data => this.setState({
				todoList:data
			})
		)
	}

	getCookie = name => {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}

	handleChange = (event) => {
		const { name,value } = event.target
		this.setState(prevState => {
			return {
				...prevState,
				activeItem:{
					...prevState.activeItem,
					title:value
				}
			}
		})
	}

	handleSubmit = (event) => {
		event.preventDefault()
		console.log(this.state.activeItem)
		const csrftoken = this.getCookie('csrftoken')
		let url = 'http://127.0.0.1:8000/api/task-create/'

		// In case of editing
		if(this.state.editing === true){
			url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
			this.setState({
				editing:false
			})
		}

		fetch(url,{
			method:'POST',
			headers:{
				'Content-type':'application/json',
				'X-CSRFToken':csrftoken
			},
			body:JSON.stringify(this.state.activeItem)
		})
		.then(response => {
			this.fetchTasks()
			this.setState(
				{
					activeItem:{
						id:null,
						title:'',
						completed:false
					}
				}
			)
		})
		.catch(error => console.log('Error:',error))
	}

	startEdit = task => {
		this.setState({
			activeItem:task,
			editing:true
		})
	}

	deleteItem = task => {
		var csrftoken = this.getCookie('csrftoken')
	
		fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
		  method:'DELETE',
		  headers:{
			'Content-type':'application/json',
			'X-CSRFToken':csrftoken,
		  },
		}).then((response) =>{
	
		  this.fetchTasks()
		})
	  }

	  complete = task => {
		  task.completed = !task.completed
		  console.log(task.completed)
		  const csrftoken = this.getCookie('csrftoken')
		  const url =`http://127.0.0.1:8000/api/task-update/${task.id}/`
		  fetch(url,{
			  method:'POST',
			  headers:{
				  'Content-type':'application/json',
				  'X-CSRFToken':csrftoken
			  },
			  body:JSON.stringify(task)
		  })
		  .then(response => this.fetchTasks())
	  }
	

  render(){
	const self = this
	let tasks = this.state.todoList
	return(
	  <div className="container">
		<div id="task-container">
		  <div id="form-wrapper">
			<form onSubmit={this.handleSubmit} id="form">
				<div className="flex-wrapper">
					<div style={{flex:6}}>
						<input onChange={this.handleChange} value={this.state.activeItem.title} className="form-control" id="title" type="text" placeholder="Your task here"/>
					</div>
					<div style={{flex:1}}>
						<input id="submit" type="submit" value="Add" className="btn btn-warning"/>
					</div>
				</div>
			</form>
		  </div>
		  <div id="list-wrapper">
			{
				
				tasks.map((task,index) => {
					return(
						<div key={index} className="task-wrapper flex-wrapper">
							<div onClick={() => self.complete(task)} style={{flex:7}}>
								{
									task.completed === true? 
									<strike>
										{task.title}
									</strike>:
									<span>
										{task.title}
									</span>
								}			
							</div>
							<div style={{flex:1}} >
								<button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
							</div>
							<div style={{flex:1}} >
								<button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete"> - </button>
							</div>
						</div>
					)
				})
			}
		  </div>
		</div>
	  </div>
	)
  }
}

export default App;
