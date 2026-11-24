package in.th.transitops.dto;

import in.th.transitops.entity.Users;
import in.th.transitops.enums.Roles;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.apache.catalina.User;

import java.io.Serializable;

/**
 * DTO for {@link Users}
 */
public record UsersDto(
        @Nullable long id,
        @NotNull @NotEmpty @NotBlank String name,
        @NotNull @Email @NotEmpty @NotBlank String email,
        @NotNull @NotEmpty @NotBlank String password,
        @NotNull Roles role
) implements Serializable {

    public Users fromDTO() {
        Users u = new Users();
        u.setEmail(email);
        u.setName(name);
        u.setRole(role);
        u.setPassword(password);
        return u;
    }
}