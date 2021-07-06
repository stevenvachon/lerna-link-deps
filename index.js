"use strict";
const execa = require("execa");
const {getPackages: getLernaPackages} = require("@lerna/project");
const {readFile} = require("fs/promises");



/**
 * An event handler that is called after a package link has been created.
 * @callback createdLinkHandler
 * @param {string} stdout
 */



/**
 * Create a global link in `npm root -g`, if non-existent.
 * @param {string} pkgDir
 * @param {createdLinkHandler} handler
 */
const createGlobalLink = async (pkgDir, handler) =>
{
	// `--no-audit` for speed
	// `--no-fund` for cleaner logs
	// `--no-package-lock` because of https://github.com/npm/npm/issues/20105
	const { stdout } = await execa(
		"npm",
		["link", "--no-audit", "--no-fund", "--no-package-lock"],
		{ cwd: pkgDir }
	);

	if (handler)
	{
		handler(stdout);
	}
};



/**
 * Link each package to the global link.
 * @param {string} pkgName
 * @param {string} pkgDir
 * @param {Package[]} lernaPackages
 * @param {createdLinkHandler} handler
 */
const createLinkToGlobal = async (pkgName, pkgDir, lernaPackages, handler) =>
{
	const promises = lernaPackages.map(async ({location}) =>
	{
		const { stdout } = await execa("npm", ["link", "--no-fund", pkgName], { cwd: location });

		if (handler)
		{
			handler(stdout);
		}
	});

	await Promise.all(promises);
};



/**
 * Find Lerna packages that depend on a specific package.
 * @param {string} depPkgName
 * @param {string} cwd
 * @returns {Package[]}
 */
const findRelevantLernaPackages = async (depPkgName, cwd) =>
{
	const promises = (await getLernaPackages(cwd)).map(async pkg =>
	{
		const manifestPath = `${pkg.location}/package.json`;
		const manifest = await readFile(manifestPath, "utf8");
		return {
			manifest: JSON.parse(manifest),
			pkg
		};
	});

	return (await Promise.all(promises))
		.filter(({manifest}) =>
		{
			if (manifest.dependencies?.[depPkgName] || manifest.devDependencies?.[depPkgName])
			{
				return true;
			}
			else
			{
				// OUTDATED COMENT?: Nested dependency packages (moduleA/node_modules/moduleB) will be handled by `npm link`
				// @todo packages that indirectly depend on depPkgName (nested) may also need links -- impossible to determine if nothing is installed
				return false;
			}
		})
		.map(({pkg}) => pkg);
};



/**
 * @param {object} config
 * @param {string} config.cwd The project root containing your Lerna config
 * @param {createdLinkHandler?} config.onGlobalLinkCreated
 * @param {createdLinkHandler?} config.onLinkCreated
 * @param {string} cofig.pkgDir The target directory of the linked package
 * @param {string} config.pkgName The package name to be linked
 * @todo add optional `config.exclude` for excluding specific Lerna packages?
 * @todo add optional `config.ignoreDependencyManifest` to link within all Lerna packages? It'd ensure that nested dependency modules (not listed within manifests) are also linked
 */
const linkLernaDependency = async ({cwd, onGlobalLinkCreated, onLinkCreated, pkgDir, pkgName}) =>
{
	const lernaPackages = await findRelevantLernaPackages(pkgName, cwd);
	// @todo if none found, stop and notify
	await createGlobalLink(pkgDir, onGlobalLinkCreated);
	await createLinkToGlobal(pkgName, pkgDir, lernaPackages, onLinkCreated);
};



module.exports = linkLernaDependency;
