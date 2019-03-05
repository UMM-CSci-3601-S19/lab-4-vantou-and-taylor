package umm3601.todo;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.bson.types.ObjectId;
import org.junit.Before;
import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

/**
 * JUnit tests for the TodoController.
 * <p>
 * Created by mcphee on 22/2/17.
 */
public class TodoControllerSpec {
  private TodoController todoController;
  private ObjectId robertaId;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Barry\",\n" +
      "                    status: true,\n" +
      "                    body: \"Nisi sit non non sunt veniam pariatur. Elit reprehenderit aliqua consectetur est dolor officia et adipisicing elit officia nisi elit enim nisi.\",\n" +
      "                    category: \"video games\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Dawn\",\n" +
      "                    status: true,\n" +
      "                    body: \"Magna exercitation pariatur in labore. Voluptate adipisicing reprehenderit dolor veniam dolore amet duis anim nisi.\",\n" +
      "                    category: \"homework\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Fry\",\n" +
      "                    status: false,\n" +
      "                    body: \"Sunt esse dolore sunt Lorem velit reprehenderit incididunt minim Lorem sint Lorem sit voluptate proident. Veniam voluptate veniam aliqua ipsum cupidatat.\",\n" +
      "                    category: \"homework\"\n" +
      "                }"));

    robertaId = new ObjectId();
    BasicDBObject roberta = new BasicDBObject("_id", robertaId);
    roberta = roberta.append("owner", "Roberta")
      .append("status", false)
      .append("body", "Pariatur ea et incididunt tempor eu voluptate laborum irure cupidatat adipisicing. Consequat occaecat consectetur qui culpa dolor.")
      .append("category", "video games");


    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(roberta.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    todoController = new TodoController(db);
  }

  // http://stackoverflow.com/questions/34436952/json-parse-equivalent-in-mongo-driver-3-x-for-java
  private BsonArray parseJsonArray(String json) {
    final CodecRegistry codecRegistry
      = CodecRegistries.fromProviders(Arrays.asList(
      new ValueCodecProvider(),
      new BsonValueCodecProvider(),
      new DocumentCodecProvider()));

    JsonReader reader = new JsonReader(json);
    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);

    return arrayReader.decode(reader, DecoderContext.builder().build());
  }

  private static String getOwner(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("owner")).getValue();
  }

  @Test
  public void getAllTodos() {
    Map<String, String[]> emptyMap = new HashMap<>();
    String jsonResult = todoController.getTodos(emptyMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 4 todos", 4, docs.size());
    List<String> names = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Barry", "Dawn", "Fry", "Roberta");
    assertEquals("Owners should match", expectedOwners, names);
  }

  @Test
  public void getTodosWhoAreTrue() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 todos", 2, docs.size());
    List<String> names = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Barry", "Dawn");
    assertEquals("Owners should match", expectedOwners, names);
  }

  @Test
  public void getRobertaById() {
    String jsonResult = todoController.getTodo(robertaId.toHexString());
    Document roberta = Document.parse(jsonResult);
    assertEquals("Owner should match", "Roberta", roberta.get("owner"));
    String noJsonResult = todoController.getTodo(new ObjectId().toString());
    assertNull("No owner should match", noJsonResult);

  }

  @Test
  public void addTodoTest() {
    String newId = todoController.addNewTodo("Workman", false,
      "Excepteur est anim ea nulla nisi veniam adipisicing voluptate ad nulla laborum eu do Lorem. Consequat consectetur velit Lorem irure consequat officia nostrud.",
      "video games");

    assertNotNull("Add new todo should return true when todo is added,", newId);
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"false"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    List<String> name = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    assertEquals("Should return owner of new todo", "Workman", name.get(2));
  }

  @Test
  public void getTodoByBody() {
    Map<String, String[]> argMap = new HashMap<>();
    //Mongo in TodoController is doing a regex search so can just take a Java Reg. Expression
    //This will search the body starting with an I or an F
    argMap.put("body", new String[]{"[I,F]"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);
    assertEquals("Should be 4 todos", 4, docs.size());
    List<String> name = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwner = Arrays.asList("Barry", "Dawn", "Fry", "Roberta");
    assertEquals("Owners should match", expectedOwner, name);

  }


}
