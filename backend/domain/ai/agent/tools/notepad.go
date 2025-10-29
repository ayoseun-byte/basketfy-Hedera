package tools

import (
	"basai/infrastructure/database"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


// Note struct
type Note struct {
	ToolName string `bson:"tool_name,omitempty"`
	Data     string `bson:"data,omitempty"`
}

// Document struct
type Document struct {
	UserId string `bson:"userId"`
	SessionId string `bson:"sessionId,omitempty"`
	Note      Note   `bson:"note,omitempty"`
	TimeStamp string `bson:"timestamp,omitempty"`
}

// NoteService defines the interface for saving and retrieving user notes.
type NoteService interface {
	SaveNote()
	GetNotes() string
}

type noteServiceImpl struct{
NoteContent NotePad
UserId string
SessionId string
K int64
}

func NewNoteService(noteContent NotePad, userId string, sessionId string, k int64) NoteService {
	return &noteServiceImpl{
		NoteContent: noteContent,
		UserId: userId,
		SessionId: sessionId,
		K: k,
	}
}


type notePadData struct {
	UserId    string            `bson:"userId"`
	SessionId string            `bson:"sessionId"`
	Note      map[string]string `bson:"note"`
	TimeStamp string            `bson:"timestamp"`
}

/*
SaveNote

Save a note for a user with the specified tool name.

Args:

	note_content (str): The content of the note to be saved.
	userId (str): The ID of the user associated with the note.
*/
func (n *noteServiceImpl) SaveNote() {
	database.Collections.Mu.RLock()
	defer database.Collections.Mu.RUnlock()
	var toolName = ""
	if n.NoteContent.Action != "" {
		toolName = n.NoteContent.Action
	}

	query := bson.D{{Key: "userId", Value: n.UserId}, {Key: "sessionId", Value: n.SessionId}, {Key: "note.tool_name", Value: toolName}}
	var docs Document
	res := database.Collections.NotePad.FindOne(context.Background(), query).Decode(&docs)

	if errors.Is(res, mongo.ErrNoDocuments) {

		document := Document{
			UserId: n.UserId,
			SessionId: n.SessionId,
			Note: Note{
				ToolName: toolName,
				Data:     fmt.Sprintf("The user just performed an action using %s tool.\nThe response is as follows: \n\n======== %s ======\n%s", toolName, time.Now().UTC().Format(time.RFC3339), n.NoteContent.Body),
			},
			TimeStamp: time.Now().UTC().Format(time.RFC3339),
		}

		_, dbErr := database.Collections.NotePad.InsertOne(context.Background(), document)
		if dbErr != nil {
			fmt.Println(dbErr)
		}

	} else {
		if docs.Note.ToolName == toolName {
			newdata := fmt.Sprintf("The user just performed an action using %s tool.\nThe response is as follows: \n\n======== %s ======\n%s", toolName, time.Now().UTC().Format(time.RFC3339), n.NoteContent.Body)
			// insert into the database
			update := bson.D{{Key: "$set", Value: bson.D{{Key: "note.data", Value: newdata}, {Key: "timestamp", Value: time.Now().UTC().Format(time.RFC3339)}}}}
			_, err := database.Collections.NotePad.UpdateOne(context.Background(), query, update)
			if err != nil {
				fmt.Println(err)
			}
		}

	}
}

func olderThan3Days(data string) (bool, error) {
	// Extract the datetime string
	start := strings.Index(data, "========") + len("========")
	end := strings.Index(data[start:], "======")
	datetimeStr := strings.TrimSpace(data[start : start+end])

	// Parse the datetime
	actionTime, err := time.Parse(time.RFC3339, datetimeStr)
	if err != nil {
		return false, err
	}

	// Check if it's 3 days old
	now := time.Now().UTC()
	duration := now.Sub(actionTime)

	if duration.Hours() > 72 {
		return true, nil
	}

	return false, nil

}

// GetNote is a function that retrieves a note from the database using a given user ID.
// It returns the data from the first note if it exists, otherwise it returns an empty string.
func (n *noteServiceImpl) GetNotes() string {
	// Construct the query to find notes by user ID
	filter := bson.M{"partnerId": n.UserId, "sessionId": n.SessionId}

	// Find the documents, sort them by timestamp in descending order to get the last k entries
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(n.K)

	// Retrieve the notes from the database, excluding the MongoDB internal ID field
	cursor, err := database.Collections.NotePad.Find(context.Background(), filter, opts)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	defer cursor.Close(context.Background())

	// Create a map to store unique notes based on tool name
	uniqueNotes := make(map[string]string)

	// Iterate over the cursor and add each note to the uniqueNotes map
	for cursor.Next(context.Background()) {
		var noteData notePadData
		err := cursor.Decode(&noteData)
		if err != nil {
			fmt.Println(err)
			continue
		}

		// Check if the "data" key exists in the noteData.Note map
		if data, ok := noteData.Note["data"]; ok {
			older, err := olderThan3Days(data)
			if err != nil {
				fmt.Println(err)
			}
			if !older {
				// Add the note to the uniqueNotes map using the tool name as the key
				uniqueNotes[noteData.Note["tool_name"]] = data
			}

		}
	}

	// Convert the uniqueNotes map to a string
	var notes []string
	for _, data := range uniqueNotes {
		notes = append(notes, data)
	}
	notesString := strings.Join(notes, "\n")

	// Return the string of unique notes
	return notesString
}
