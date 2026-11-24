package in.th.transitops.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, long id) {
        super(resource + " not found with id: " + id);
    }
    public ResourceNotFoundException(String resource, String parameter, String value) {
        super(resource + " not found with " + parameter + " :"+ value);
    }
}
