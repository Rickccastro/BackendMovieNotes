const { hash,compare}=require("bcryptjs")
const AppError = require('../utils/AppError')

const sqliteConnection=require('../database/sqlite/index')

class UsersController {
  async create(request, response) {
    /**pegando pelo json */
    const { name, email, password } = request.body

    /**conectando ao banco */
    const database=await sqliteConnection();

    /**checando se email ja for cadastrado não cadastrar um novo */
    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])
    if (checkUserExists){
      throw new AppError("Este e-mail já está em uso.")
    }

    /**senha com hash */
    const hashedPassword= await hash(password,8)

    /**Inserindo os dados*/
    await database.run("INSERT INTO users(name,email,password) VALUES(?,?,?)",
    [name,email,hashedPassword])


    return response.status(201).json()

  }

  async update(request,response){
    /**pegando pelo json  */
    const { name, email, password, old_password} = request.body
    /**pegando pelo parametro da url */
    const { id } = request.params

    /**estabelecendo conexão com o banco */
    const database = await sqliteConnection()

    /** buscando o usuario pelo id*/
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

    /**se o id não corresponder a um usuario */
    if(!user) {
     throw new AppError("Usuário não encontrado")
    }

    /**checando se o novo email já pertence a um usuario */
    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    /**se um usuario com id diferente já tiver o email que está tentando ser cadastrado email*/
    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
     throw new AppError("Este e-mail já está em uso.")
    }

    user.name = name?? user.name
    user.email= email?? user.email

    /** Setando nova senha */

    if(password && !old_password) {
        throw new AppError("Informe a senha antiga para definir a nova senha")
       }

       /**compara a senha antiga fornecida pelo json não for igual a senha do banco */
       if(password && old_password) {
        const checkOldPassword = await compare(old_password, user.password)
  
        if(!checkOldPassword) {
          throw new AppError("A senha antiga não confere.")
        }
        /**atualizando e botando hash a nova senha*/
        user.password = await hash(password, 8)
       }

    await database.run(`
     UPDATE users SET
     name = ?,
     email = ?,
     password=?,
     updated_at = DATETIME('now')
     WHERE id = ?`, 
     [user.name, user.email,user.password, id]
   )

   return response.json()
 }
}

module.exports = UsersController