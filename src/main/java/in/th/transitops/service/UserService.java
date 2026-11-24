package in.th.transitops.service;

import in.th.transitops.dto.UsersDto;
import in.th.transitops.entity.Users;
import in.th.transitops.exception.ResourceNotFoundException;
import in.th.transitops.repos.UsersRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private JWTService jwtService;

    @Override
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        return usersRepository.findByEmail(username);
    }

    public Users register(UsersDto dto) {
        if (!usersRepository.existsByEmail(dto.email())) {
            Users user = dto.fromDTO();
            user.setPassword(jwtService.encodePassword(user.getPassword()));
            return usersRepository.save(user);
        } else throw new DuplicateKeyException("User already exists with email = " + dto.email());
    }

    public UsersDto login(UsersDto dto) {
        Users user = usersRepository.findByEmail(dto.email());
        if (user == null)
            throw new ResourceNotFoundException("User","email",dto.email());
        else if(!jwtService.checkPassword(dto.password(), user.getPassword()))
            throw new IllegalArgumentException("Email or Password doesn't match");
        else return fromEntity(user);
    }

    public UsersDto fromEntity(Users user){
        return new UsersDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                null,
                user.getRole()
        );
    }
}
