import { z } from "zod";
import { base } from "../middlewares/base";
import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspace";
import { Organizations } from "@kinde/management-api-js";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcjet/heavy-write";
import "@/lib/kinde-management.ts";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";
async function fetchAllOrganizations() {
  const res = await Organizations.getOrganizations({ pageSize: 100 });
  return res.organizations ?? [];
}

export const listWorkspaces = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "list all workspaces",
    tags: ["workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        })
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    })
  )
  .handler(async ({ context, errors }) => {

    const { getUserOrganizations } = getKindeServerSession();
    console.log("Getting organizations...");

    const organizations = await getUserOrganizations();
    console.log("Organizations:", organizations);
    if (!organizations) {
      throw errors.FORBIDDEN();
    }
    const orgCodes = organizations.orgCodes ?? [];

    const allOrgs = await fetchAllOrganizations();
    const orgByCode = new Map(allOrgs.map((o) => [o.code, o]));

    const workspaces = orgCodes.map((code) => {
      const org = orgByCode.get(code);
      const name = org?.name ?? "My Workspace";

      return {
        id: code,
        name,
        avatar: name.charAt(0) ?? "M",
      };
    });

    console.log("Workspaces:", workspaces);

    return {
      workspaces,
      user: context.user,
      currentWorkspace: context.workspace,
    };

  });

export const createWorkspace = base
.use(requiredAuthMiddleware)
.use(requiredWorkspaceMiddleware)
.use(standardSecurityMiddleware)
.use(heavyWriteSecurityMiddleware)
.use(writeSecurityMiddleware)
.use(readSecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "Create a new workspace",
    tags: ["workspace"],
  })
  .input(workspaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    })
  )
  .handler(async ({ context, errors, input }) => {
  
    let data;

    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
      console.log("CREATE ORG SUCCESS", data);
    } catch (err) {
      console.error("CREATE ORG ERROR", err);
      throw errors.FORBIDDEN();
    }

    if (!data.organization?.code) {
      throw errors.FORBIDDEN({
        message: "Org code is not defined",
      });
    }

    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ["admin"],
            },
          ],
        },
      });
      console.log("ADD USER SUCCESS");
    } catch (err) {
      console.error("ADD USER ERROR", err);
      throw errors.FORBIDDEN();
    }

    const { refreshTokens } = getKindeServerSession();

    await refreshTokens();

    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });
