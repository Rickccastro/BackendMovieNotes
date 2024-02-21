const config =require("../../../knexfile")
const knex=require("knex")

/**puxando a config do knex.js */
const connection=knex(config.development)


module.exports=connection