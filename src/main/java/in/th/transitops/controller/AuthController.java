package in.th.transitops.controller;

import in.th.transitops.dto.UsersDto;
import in.th.transitops.entity.Users;
import in.th.transitops.service.JWTService;
import in.th.transitops.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<UsersDto> register(@Validated @RequestBody UsersDto usersDto) {
        Users user = userService.register(usersDto);
        String refresh = jwtService.createRefreshToken(user.getUsername(), "ROLE_"+(user.getRole().name()));
        String access = jwtService.createAccessToken(user.getUsername(), "ROLE_"+(user.getRole().name()));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Refresh_Token", refresh)
                .header("Access_Token", access)
                .body(userService.fromEntity(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UsersDto> login(@Validated @RequestBody UsersDto usersDto) {
        UsersDto user = userService.login(usersDto);
        String refresh = jwtService.createRefreshToken(user.email(), "ROLE_"+(user.role().name()));
        String access = jwtService.createAccessToken(user.email(), "ROLE_"+(user.role().name()));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Refresh_Token", refresh)
                .header("Access_Token", access)
                .body(user);
    }
}
