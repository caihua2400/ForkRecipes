import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader,clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as listView from './views/listView';
import * as LikesView from './views/LikesView';


/*
Global state of the app
search object
current recipe object
shopping list object
liked recipes
*/

const state={

};

/*
search controller
*/
const controlSearch=async ()=> {
  //1  get the query from the view.
  const query=searchView.getInput();  
  console.log(query);//TODO

  if(query){
      //2  New search object and add it to the state
      state.search=new Search(query);
      //3  preparing the UI for the result.
      searchView.clearInput();
      searchView.clearResults();
      renderLoader(elements.searchRes);
      //4 search for the recipes.
      await state.search.getResults();

      //5 render results on UI.
     //console.log(JSON.parse(state.search.result));
     clearLoader();
     console.log(state.search.result.data.recipes + ' ');
     searchView.renderResults(state.search.result.data.recipes);
     

  }
};

elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();

});



elements.searchResPages.addEventListener(
  'click', e=>{
    const btn=e.target.closest('.btn-inline');
    if(btn){
      const goTopage= parseInt(btn.dataset.goto,10);
      searchView.clearResults();
      searchView.renderResults(state.search.result.data.recipes,goTopage);
    }
  }
);

/*
recipe controller
*/

const controlRecipe= async ()=>{
  const id=window.location.hash.replace('#','');
  if(id){
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    if(state.search) searchView.highlightSelected(id);
    //create new recipe object
    state.recipe=new Recipe(id);
    //window.r=state.recipe;
    // get recipe data
    try{
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      //calculate servings and time.
      state.recipe.calcTime();
      state.recipe.calcServings();
      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
    }catch(error){
      console.log(error);
    }
    
  }
};

window.addEventListener('hashchange',controlRecipe);
window.addEventListener('load',controlRecipe);

//handling recipe clicks
elements.recipe.addEventListener('click', e=>{
  console.log('button clicked');
  console.log(e.target);
   if(e.target.matches('.btn-decrease, .btn-decrease *')){
     // decrease button is clicked
     console.log('decrease button clicked');
     if(state.recipe.servings >1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
     }
    

   }else if(e.target.matches('.btn-increase, .btn-increase *')){
    // increase button is clicked
    console.log('increasew button clicked');
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
          controlList();
  }else if(e.target.matches('.recipe__love, .recipe__love *')){
    controlLike();
  }
});


/*
List controller
*/

const controlList = ()=>{
  // create a new list if there is not a list yet.
  if(!state.list) state.list= new List();
  // add each ingredient to the list
  state.recipe.ingredients.forEach(el =>{
    const item=state.list.addItem(el.count,el.unit,el.ingredient);

    listView.renderItem(item);
  }); 
};

// handle delete and update item events

elements.shopping.addEventListener('click',e=>{
  const id=e.target.closest('.shopping__item').dataset.itemid;
  // handle the delete button;
  if(e.target.matches('.shopping__delete , .shopping__delete *')){
    // delete from the state
    state.list.deleteItem(id);
    //delete from the UI
    listView.delItem(id);
    // handle the count update
  }else if(e.target.matches('.shopping__count-value')){
    const val= parseFloat( e.target.value,10);
    state.list.updateCount(id,val);
  }
});

/*
Likes controller
*/


const controlLike= ()=>{
  if(!state.likes) state.likes= new Likes(); 
  const currentID=state.recipe.id;

  // User has not yet liked current recipe
  if(!state.likes.isLiked(currentID)){
    // add like to the state
    const newLike= state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // toggle the like button
    LikesView.toggleLikeButton(true);

    // add like to the UI list
    LikesView.renderLikes(newLike);
      

    // user has liked the current recipe
  }else{
       // remove like to the state
       state.likes.deleteLike(currentID);
        LikesView.toggleLikeButton(false);

    // remove like to the UI list
    LikesView.deleteLikes(currentID);
  }
  LikesView.toggleLikesMenu(state.likes.getNumLikes());
};

window.addEventListener('load',()=>{

  state.likes= new Likes(); 
  state.likes.readStorage();
LikesView.toggleLikesMenu(state.likes.getNumLikes());
state.likes.likes.forEach((like)=>{
LikesView.renderLikes(like);
});
});
