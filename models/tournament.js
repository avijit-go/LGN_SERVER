import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    userName: {
        type: String
    }
}, {timestamps: true});


    const tournamentScheema = new mongoose.Schema({
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
        },
        image:{
            type: String
        },
        streaming_link:{
            type: String,
            required: true
        },
        tournament_by:{
            type: String,
            required: true
        },
        streaming_date:{
            type: String,
            required: true
        },
        streaming_time:{
            type: String,
            required: true
        },
        views:{
            type: String,
            required: true,
            default: "0"
        },
        is_active: {
            type: String,
            default: function() {
                // this refers to the document being created
                if (this.created_by === 'admin') {
                    return "active";
                }else{
                    return "pending";
                }
                
            }
        },
        is_deleted:{
            type: Boolean,
            default: false
        },
        created_by: {
           type: String,
           required: true,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        comments: [CommentSchema],
    },{timestamps: true});

    export default mongoose.model("Tournament",tournamentScheema);  