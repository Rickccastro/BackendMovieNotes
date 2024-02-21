const knex = require("../database/knex/index")


class NotesController {

    async createNotes(request, response) {
        const { title, description,rating ,tags} = request.body
        const { user_id } = request.params
        /** inserindo os dados do json */
        const [note_id] = await knex("movie_notes").insert({
          title,
          description,
          rating,
          user_id
        })

        /**inserindo na table tag as informações do json */
        const tagsInsert = tags.map(name => {
            return {
              note_id,
              name,
              user_id
            }
          })
      
          await knex("movie_tags").insert(tagsInsert)    

        response.json()
    }

    async showNotes(request,response){
        const {id}=request.params

        const movie_notes=await knex("movie_notes").where({id}).first()

        const tags = await knex("movie_tags").where({note_id:id}).orderBy("name")

        return response.json(
            /**espalha note */
            {
                ...movie_notes,
                tags,
            }
        )
    }

    async deleteNotes(request,response){
        const {id}=request.params

        await knex("movie_notes").where({ id }).delete()

        return response.json()
    }

    async listNotes(request,response){
        const {user_id,title,tags}=request.query

        let notes

        if(tags){
            const filterTags=tags.split(',').map(tag=>tag.trim())
            notes=await knex ("movie_tags").whereIn("name",filterTags)
             
            notes=await knex ("movie_tags").select([
                "movie_notes.id", 
                "movie_notes.title",
                "movie_notes.user_id"

            ]).where("movie_notes.user_id",user_id).
            whereLike("movie_notes.title",`%${title}%`)
            .whereIn("movie_tags.name",filterTags)
            .innerJoin("movie_notes","movie_notes.id","movie_tags.note_id")


        }else{
             notes= await knex("movie_notes")
            .where({user_id})
            .whereLike("title",`%${title}%`)
            .orderBy("title")
        }

        const userTags= await knex("movie_tags").where({user_id})

        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(movie_tags => movie_tags.note_id === note.id);
            return {
                ...note, 
                tags: noteTags
            };
        });
        
        return response.json(notesWithTags)

    }
}

module.exports = NotesController