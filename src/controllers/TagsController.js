const knex = require("../database/knex/index")


class TagsController {

    async listTags(request, response) {
        const { user_id } = request.params

        const tags = await knex("movie_tags").where({ user_id })

        return response.json(tags)
    }

}


module.exports = TagsController