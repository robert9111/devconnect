import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

//Creating a Login constant that takes in our data
const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Destructures the formData object and puts the data into respective fields
    const { name, email, password, password2 } = formData;
    //Creating on change function to set data = to its name in form
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    // On submit function that checks passwords and registers user if data matches
    const onSubmit = async e => {
        //Prevents default action of submit button
        e.preventDefault();
        //validates password
        console.log("sent");
    };

    return <Fragment>
                <h1 className="large text-primary">Sign In</h1>
                <p className="lead"><i className="fsas fa-user"></i> Sign into your Account</p>
                <form className="form" onSubmit={e => onSubmit(e)}>
                  <div className="form-group">
                    <input type="email" 
                    placeholder="Email Address" 
                    name="email" 
                    value={email}
                    onChange={e => onChange(e)}
                    required 
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      minLength="6"
                      value={password}
                      onChange={e => onChange(e)}
                    />
                  </div>
                  <input type="submit" className="btn btn-primary" value="Login" />
                </form>

                <p className="my-1">
                  Already have an account? <Link to="/register">Sign Up</Link>
                </p>
    </Fragment>
};

export default Login