package com.oauth2.demo.resourceserver.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter delegate;

    public JwtAuthenticationConverter() {
        this.delegate = new JwtGrantedAuthoritiesConverter();
        this.delegate.setAuthoritiesClaimName("scope");
        this.delegate.setAuthorityPrefix("SCOPE_");
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = delegate.convert(jwt);
        String scope = jwt.getClaimAsString("scope");

        if (scope != null && !scope.isEmpty()) {
            Stream<GrantedAuthority> scopeAuthorities = Stream.of(scope.split(" "))
                .map(s -> new SimpleGrantedAuthority("SCOPE_" + s));
            authorities = Stream.concat(authorities.stream(), scopeAuthorities)
                .collect(Collectors.toList());
        }

        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }
}
