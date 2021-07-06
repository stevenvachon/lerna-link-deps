"use strict";
const {copy, remove} = require("fs-extra");
const execa = require("execa");
const {expect} = require("chai");
const {it} = require("mocha");
const requireCacheless = require("import-fresh");



const FIXTURE_DIR = "./temp"; // after copying
const FIXTURE_PROJECT_DIR = `${FIXTURE_DIR}/project`;
const PACKAGE_NAME = "isurl";



const cli = pkgName => execa(
	"node",
	[`${__dirname}/cli.js`, `--pkgName=${pkgName}`, `--pkgDir=../${pkgName}`],
	{ cwd: FIXTURE_PROJECT_DIR }
);



const prepareFixture = async () =>
{
	await copy("./fixture", FIXTURE_DIR);
	await execa("npm", ["install"], { cwd: FIXTURE_PROJECT_DIR });
};

const removeFixture = () => remove(FIXTURE_DIR);



before(async function()
{
	this.timeout(2 * 60 * 1_000);
	await removeFixture(); // in case of previous failure
	await prepareFixture();
});

after(() => removeFixture());



it("works", async () =>
{
	await cli(PACKAGE_NAME);
	const _module = requireCacheless(`${FIXTURE_PROJECT_DIR}/packages/package`);
	expect(_module()).to.equal("symlinked");
});
