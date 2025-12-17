package ee.kerrete.ainterview.risk.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Normalizes risk API paths by stripping a single trailing '.' to tolerate FE typos.
 * Scope: only applies to /api/risk/** to avoid affecting other routes.
 */
@Component
@Slf4j
public class RiskRequestNormalizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (uri != null && uri.startsWith("/api/risk/") && uri.endsWith(".") && uri.length() > "/api/risk/".length()) {
            String normalized = uri.substring(0, uri.length() - 1);
            HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(request) {
                @Override
                public String getRequestURI() {
                    return normalized;
                }

                @Override
                public String getServletPath() {
                    return normalized;
                }
            };
            if (log.isDebugEnabled()) {
                log.debug("Normalized trailing-dot URI '{}' -> '{}'", uri, normalized);
            }
            filterChain.doFilter(wrapper, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}

