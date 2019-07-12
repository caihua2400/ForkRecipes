import axios from 'axios';
import {API_KEY, proxyUrl} from '../config';

export default class Recipe{
    constructor(id){
        this.id=id;
    }

    async getRecipe(){
        try{
            const res= await axios(`${proxyUrl}https://www.food2fork.com/api/get?key=${API_KEY}&rId=${this.id}`);
            if(res){
                this.title=res.data.recipe.title;
            this.author=res.data.recipe.publisher;
            this.img=res.data.recipe.image_url;
            this.url=res.data.recipe.source_url;
            this.ingredients=res.data.recipe.ingredients;
            //console.log(res.data.recipe.ingredients);
            }else{
                console.log('res does not exist');
            }
            
            

        }catch(error){
            console.log(error);
        }
    }

    calcTime(){
        const numIng= this.ingredients.length;
        this.time= Math.ceil(numIng/3) * 15;
    }

    calcServings(){
        this.servings=4;
    }

    parseIngredients(){
        const unitsLong=['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitsShort=['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units=[...unitsShort,'kg','g'];
        const newIngredients=this.ingredients.map(el =>{
             // 1) uniform units
            let ingredient=el.toLowerCase();
            unitsLong.forEach((unit,i)=>{
                ingredient=ingredient.replace(unit,unitsShort[i]);
            });
             // 2) Remove parentess
             // replace(/ *\([^)]*\) */g, "");
             ingredient=ingredient.replace(/ *\([^)]*\) */g, ' ');

             // 3) Parse ingredients into count, units, ingredients
             const arrIng=ingredient.split(' ');
             const unitIndex=arrIng.findIndex(el2 => unitsShort.includes(el2));

             let objIng;
             if(unitIndex >-1){
                 // There is a unit
                 const arrCount=arrIng.slice(0,unitIndex);
                 let count;
                 if(arrCount === 1){
                     count= eval( arrIng[0].replace('-','+'));

                 }else{
                     count= eval( arrIng.slice(0,unitIndex).join('+'));
                 }
                 objIng={
                     count,
                     unit: arrIng[unitIndex],
                     ingredient: arrIng.slice(unitIndex+1).join(' ')

                 };
             }else if(unitIndex === -1){
                 // There is no unit
                 objIng={
                     count :1,
                     unit: '',
                     ingredient
                 };
             }else if(parseInt(arrIng[0],10)){
                 // there is no unit but first element is a number
                 objIng={
                     count: parseInt(arrIng[0],10),
                     unit:'',
                     ingredient: arrIng.slice(1).join(' ')
                 };
             }
             return objIng;
        });
        this.ingredients=newIngredients;
    }

    updateServings(type){
        //servings
       const newServings= type === 'dec' ? this.servings -1 : this.servings +1;
        //ingredients
        this.ingredients.forEach(ing =>{
            ing.count=ing.count * (newServings /this.servings);
        });
        this.servings=newServings;

    }
} 