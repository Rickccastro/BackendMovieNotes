const { Router }=require('express')

const NotesController=require("../controllers/NotesController")

const notesRoutes=Router()

const notesController=new NotesController()

notesRoutes.get("/",notesController.listNotes)
notesRoutes.post("/:user_id",notesController.createNotes)
notesRoutes.get("/:id",notesController.showNotes)
notesRoutes.delete("/:id",notesController.deleteNotes)



module.exports = notesRoutes