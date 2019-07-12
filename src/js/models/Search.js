import axios from 'axios';
import {API_KEY, proxyUrl} from '../config';

//API KEY e955c054656898b77987ea43f34b387d 
//https://www.food2fork.com/api/search?key=YOUR_API_KEY&q=chicken%20breast&page=2

export default class Search{
    constructor (query){
        this.query=query;
    }
    async getResults(){
        try{
    
            var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const API_KEY='388445ec40b533244705a05758410f2c';
            this.result= await axios(`${proxyUrl}https://www.food2fork.com/api/search?key=${API_KEY}&q=${this.query}`);
            console.log(this.result);
        }catch(error){
            console.log(error);
        }
    }
}




