"use client";

import { BungieClientProtocol } from "bungie-net-core";
import { useBungieSession } from "next-bungie-auth/client";
import { createContext, useCallback, useContext } from "react";

export const BungieClientContext = createContext<
  BungieClientProtocol | undefined
>(undefined);

export const BungieClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useBungieSession();

  const http = useCallback<BungieClientProtocol["fetch"]>(
    async (config) => {
      const apiKey = process.env.BUNGIE_API_KEY;
      if (!apiKey) {
        throw new Error("Missing BUNGIE_API_KEY");
      }

      const payload: RequestInit & { headers: Headers } = {
        method: config.method,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: config.body,
        credentials: "omit",
        headers: new Headers(config.headers ?? {}),
      };

      if (config.url.pathname.match(/\/Platform\//)) {
        payload.headers.set("X-API-KEY", apiKey);

        if (session.data && "accessToken" in session.data) {
          payload.headers.set(
            "Authorization",
            `Bearer ${session.data.accessToken}`
          );
        }
      }

      const res = await fetch(config.url, payload);

      const text = await res.text();
      const contentType = res.headers.get("Content-Type");

      if (!res.ok) {
        if (contentType?.includes("application/json")) {
          const data = JSON.parse(text);
          if ("ErrorCode" in data && data.ErrorCode !== 1) {
            throw new Error(data.Message, {
              cause: {
                errorStatus: res.status,
                errorUrl: config.url.pathname,
                data: data,
              },
            });
          } else if ("error_description" in data) {
            throw new Error(data.error_description, {
              cause: {
                errorStatus: res.status,
                errorUrl: config.url.pathname,
                data: data,
              },
            });
          }
        } else if (contentType?.includes("text/html")) {
          throw new Error("HTML Response", {
            cause: {
              errorStatus: res.status,
              errorUrl: config.url.pathname,
              data: text,
            },
          });
        }
        throw new Error("Unknown Error", {
          cause: {
            errorStatus: res.status,
            errorUrl: config.url.pathname,
            data: text,
          },
        });
      }

      return JSON.parse(text);
    },
    [session.data]
  );

  return (
    <BungieClientContext.Provider
      value={{
        fetch: http,
      }}
    >
      {children}
    </BungieClientContext.Provider>
  );
};

export const useBungieClient = () => {
  const client = useContext(BungieClientContext);
  if (!client) {
    throw new Error(
      "useBungieClient must be used within a BungieClientProvider"
    );
  }
  return client;
};
