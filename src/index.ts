import type { StringMap, Optional, OptionalJSON } from "@nova-registry/types";
import * as semver from "semver";
import * as logger from "@nova-registry/logger";

/**
 * The namespace for the NovaRegistry json package. Allows for the management of package jsons, as well as other response jsons.
 */
namespace json {
    export interface PackageExport {
        main: string;
        types: Optional<string>;
    }

    export interface PackageAuthor {
        name: string;
        email: Optional<string>;
        url: Optional<string>;
    }

    export interface Package {
        name: string;
        version: string;
        description: string;
        author: PackageAuthor;
        maintainers: Optional<StringMap<PackageAuthor>>;
        exports: StringMap<PackageExport>;
    }

    export function isPackageExport(x: any): x is PackageExport {
        if (!x || typeof x !== "object") {
            logger.err("Invalid PackageExport: not an object.");
            return false;
        }

        const { main, types } = x as PackageExport;

        if (!main || typeof main !== "string") {
            logger.err("Invalid PackageExport.main: expected string, got:", main);
            return false;
        }

        if (types != null && typeof types !== "string") {
            logger.err("Invalid PackageExport.types: expected string or null, got:", types);
            return false;
        }

        return true;
    }

    export function isPackageAuthor(x: any): x is PackageAuthor {
        if (!x || typeof x !== "object") {
            logger.err("Invalid PackageAuthor: not an object.");
            return false;
        }

        const { name, email, url } = x as PackageAuthor;

        if (!name || typeof name !== "string") {
            logger.err("Invalid PackageAuthor.name: expected string, got:", name);
            return false;
        }

        if (email != null && typeof email !== "string") {
            logger.err("Invalid PackageAuthor.email: expected string or null, got:", email);
            return false;
        }

        if (url != null && typeof url !== "string") {
            logger.err("Invalid PackageAuthor.url: expected string or null, got:", url);
            return false;
        }

        return true;
    }

    export function isPackage(x: any): x is Package {
        if (!x || typeof x !== "object") {
            logger.err("Invalid Package: not an object.");
            return false;
        }

        const { name, version, description, author, maintainers, exports } = x as Package;

        if (!name || typeof name !== "string" || name.toLowerCase() !== name) {
            logger.err("Invalid Package.name: expected lowercase string, got:", name);
            return false;
        }

        if (!version || typeof version !== "string" || !semver.valid(version)) {
            logger.err("Invalid Package.version: not a valid semver string, got:", version);
            return false;
        }

        if (typeof description !== "string") {
            logger.err("Invalid Package.description: expected string, got:", description);
            return false;
        }

        if (!author || typeof author !== "object" || !isPackageAuthor(author)) {
            logger.err("Invalid Package.author.");
            return false;
        }

        if (maintainers != null) {
            if (typeof maintainers !== "object") {
                logger.err("Invalid Package.maintainers: expected object or null, got:", maintainers);
                return false;
            }

            for (const [key, value] of Object.entries(maintainers)) {
                if (typeof key !== "string" || !isPackageAuthor(value)) {
                    logger.err(`Invalid maintainer entry for key '${key}':`, value);
                    return false;
                }
            }
        }

        if (!exports || typeof exports !== "object") {
            logger.err("Invalid Package.exports: expected object, got:", exports);
            return false;
        }

        for (const [key, value] of Object.entries(exports)) {
            if (typeof key !== "string") {
                logger.err("Invalid export key:", key);
                return false;
            }

            if (!isPackageExport(value)) {
                logger.err(`Invalid PackageExport for key '${key}':`, value);
                return false;
            }
        }

        return true;
    }

    export type RemotePackageTags = {
        latest: string;
    } & StringMap<string>;

    export interface RemotePackage {
        id: string;
        name: string;
        author: PackageAuthor;
        tags: RemotePackageTags;
        versions: StringMap<Package>;
    }

    export function isTagValid(tag: string, versions: StringMap<Package>) {
        if (!tag || typeof tag != "string")
        {
            logger.err("Invalid Parameter 'tag': not a string.");
            return false;
        }
        else if (!versions || typeof versions != "object")
        {
            logger.err("Invalid Parameter 'versions': not a StringMap of Packages");
            return false;
        }
        else {
            const entries = Object.entries(versions);

            for (const [key, value] of entries) {
                if (typeof key != "string")
                {
                    logger.err("Invalid StringMap: key not a string.");
                    return false;
                }
                else if (!isPackage(value))
                {
                    return false;
                }
            }
        }

        if (versions[tag])
            return true;

        return false;
    }

    export function isRemotePackage(x: any): x is RemotePackage {
        if (!x || typeof x !== "object") {
            logger.err("Invalid RemotePackage: not an object.");
            return false;
        }

        const { id, name, author, tags, versions } = x as RemotePackage;

        if (!id || typeof id !== "string") {
            logger.err("Invalid RemotePackage.id: expected string, got:", id);
            return false;
        }

        if (!name || typeof name !== "string") {
            logger.err("Invalid RemotePackage.name: expected string, got:", name);
            return false;
        }

        if (!author || typeof author !== "object" || !isPackageAuthor(author)) {
            logger.err("Invalid RemotePackage.author.");
            return false;
        }

        if (!versions || typeof versions !== "object") {
            logger.err("Invalid RemotePackage.versions: expected object, got:", versions);
            return false;
        }

        for (const [key, value] of Object.entries(versions)) {
            if (typeof key !== "string" || !isPackage(value)) {
                logger.err(`Invalid RemotePackage version '${key}':`, value);
                return false;
            }
        }

        if (!tags || typeof tags !== "object") {
            logger.err("Invalid RemotePackage.tags: expected object, got:", tags);
            return false;
        }

        for (const [key, value] of Object.entries(tags)) {
            if (typeof key !== "string" || typeof value !== "string" || !isTagValid(value, versions)) {
                logger.err(`Invalid RemotePackage tag '${key}':`, value);
                return false;
            }
        }

        return true;
    }
}

export = json;