const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const { expect } = chai;

const {
    castVote,
    getVoteStatus,
    changeVote,
    deleteVote,
} = require('../controllers/voteController');

const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

function mockRes() {
    return {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
    };
}


/* Vote Controller Tests */

describe('Vote Controller', () => {
    describe('castVote', () => {
        it('should 404 if candidate not found or not active', async () => {
            const req = { params: { id: 'x' }, user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const cFind = sinon.stub(Candidate, 'findById').resolves(null);

            await castVote(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({ message: 'Candidate not found or not active' })).to.be.true;

            cFind.restore();
        });

        it('should 400 if user already voted', async () => {
            const userId = new mongoose.Types.ObjectId();
            const req = { params: { id: 'x' }, user: { _id: userId } };
            const res = mockRes();

            const candidateDoc = { _id: 'x', status: 'active', voteCount: 10, save: sinon.stub().resolvesThis() };
            const cFind = sinon.stub(Candidate, 'findById').resolves(candidateDoc);
            const vFind = sinon.stub(Vote, 'findOne').resolves({ _id: 'v' });

            await castVote(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'You have already voted' })).to.be.true;

            cFind.restore();
            vFind.restore();
        });

        it('should create a vote and increment candidate count', async () => {
            const userId = new mongoose.Types.ObjectId();
            const cid = new mongoose.Types.ObjectId();
            const req = { params: { id: cid }, user: { _id: userId } };
            const res = mockRes();

            const candidateDoc = { _id: cid, status: 'active', voteCount: 0, save: sinon.stub().resolvesThis() };
            const cFind = sinon.stub(Candidate, 'findById').resolves(candidateDoc);
            const vFind = sinon.stub(Vote, 'findOne').resolves(null);

            const createdVote = { _id: new mongoose.Types.ObjectId(), voterId: userId, candidateId: cid };
            const vCreate = sinon.stub(Vote, 'create').resolves(createdVote);

            await castVote(req, res);

            expect(vCreate.calledOnce).to.be.true;
            expect(candidateDoc.voteCount).to.equal(1);
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(createdVote)).to.be.true;

            cFind.restore();
            vFind.restore();
            vCreate.restore();
        });

        it('should 500 on error', async () => {
            const req = { params: { id: 'x' }, user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const cFind = sinon.stub(Candidate, 'findById').throws(new Error('DB Error'));

            await castVote(req, res);

            expect(res.status.calledWith(500)).to.be.true;

            cFind.restore();
        });
    });

    describe('getVoteStatus', () => {
        it('should return hasVoted=false if no vote', async () => {
            const req = { user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const vFind = sinon.stub(Vote, 'findOne').returns({
                populate: sinon.stub().resolves(null),
            });

            await getVoteStatus(req, res);

            expect(res.json.calledWith({ hasVoted: false, vote: null })).to.be.true;

            vFind.restore();
        });

        it('should return populated vote details if exists', async () => {
            const req = { user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const candidate = {
                _id: new mongoose.Types.ObjectId(),
                name: 'Alice',
                position: 'President',
                manifesto: 'Hi',
                photoUrl: 'http://img',
            };
            const voteDoc = { _id: new mongoose.Types.ObjectId(), candidateId: candidate, createdAt: new Date() };

            const vFind = sinon.stub(Vote, 'findOne').returns({
                populate: sinon.stub().resolves(voteDoc),
            });

            await getVoteStatus(req, res);

            expect(res.json.calledOnce).to.be.true;
            const payload = res.json.firstCall.args[0];
            expect(payload.hasVoted).to.equal(true);
            expect(payload.vote.candidateName).to.equal('Alice');
            expect(payload.vote.position).to.equal('President');

            vFind.restore();
        });
    });

    describe('changeVote', () => {
        it('should 404 if new candidate not found/active', async () => {
            const req = { params: { id: 'x' }, user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const cFind = sinon.stub(Candidate, 'findById').resolves(null);

            await changeVote(req, res);

            expect(res.status.calledWith(404)).to.be.true;

            cFind.restore();
        });

        it('should 400 if user has not voted yet', async () => {
            const req = { params: { id: 'x' }, user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const cFind = sinon.stub(Candidate, 'findById').resolves({ _id: 'x', status: 'active' });
            const vFind = sinon.stub(Vote, 'findOne').resolves(null);

            await changeVote(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'You have not voted yet' })).to.be.true;

            cFind.restore();
            vFind.restore();
        });

        it('should change vote: decrement old, increment new', async () => {
            const userId = new mongoose.Types.ObjectId();
            const oldCid = new mongoose.Types.ObjectId();
            const newCid = new mongoose.Types.ObjectId();

            const req = { params: { id: newCid }, user: { _id: userId } };
            const res = mockRes();

            const newCandidate = { _id: newCid, status: 'active', voteCount: 5, save: sinon.stub().resolvesThis() };
            const oldCandidate = { _id: oldCid, voteCount: 9, save: sinon.stub().resolvesThis() };

            const cFind = sinon.stub(Candidate, 'findById');
            cFind.onFirstCall().resolves(newCandidate); // first check (new candidate)
            cFind.onSecondCall().resolves(oldCandidate); // old candidate

            const existingVote = {
                _id: new mongoose.Types.ObjectId(),
                voterId: userId,
                candidateId: oldCid,
                save: sinon.stub().resolvesThis(),
            };
            const vFind = sinon.stub(Vote, 'findOne').resolves(existingVote);

            await changeVote(req, res);

            expect(oldCandidate.voteCount).to.equal(8);
            expect(newCandidate.voteCount).to.equal(6);
            expect(existingVote.save.calledOnce).to.be.true; // updated candidateId
            expect(res.status.calledWith(200)).to.be.true;

            cFind.restore();
            vFind.restore();
        });

        it('should 500 on error', async () => {
            const req = { params: { id: 'x' }, user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const cFind = sinon.stub(Candidate, 'findById').throws(new Error('DB Error'));

            await changeVote(req, res);

            expect(res.status.calledWith(500)).to.be.true;

            cFind.restore();
        });
    });

    describe('deleteVote', () => {
        it('should 400 if user has not voted', async () => {
            const req = { user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const vFind = sinon.stub(Vote, 'findOne').resolves(null);

            await deleteVote(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'You have not voted yet' })).to.be.true;

            vFind.restore();
        });

        it('should delete vote and decrement candidate count', async () => {
            const userId = new mongoose.Types.ObjectId();
            const cid = new mongoose.Types.ObjectId();

            const req = { user: { _id: userId } };
            const res = mockRes();

            const voteDoc = { _id: new mongoose.Types.ObjectId(), candidateId: cid };
            const vFind = sinon.stub(Vote, 'findOne').resolves(voteDoc);

            const candidateDoc = { _id: cid, voteCount: 3, save: sinon.stub().resolvesThis() };
            const cFind = sinon.stub(Candidate, 'findById').resolves(candidateDoc);

            const vDelete = sinon.stub(Vote, 'deleteOne').resolves({ deletedCount: 1 });

            await deleteVote(req, res);

            expect(candidateDoc.voteCount).to.equal(2);
            expect(vDelete.calledOnceWith({ _id: voteDoc._id })).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Vote deleted successfully' })).to.be.true;

            vFind.restore();
            cFind.restore();
            vDelete.restore();
        });

        it('should 500 on error', async () => {
            const req = { user: { _id: new mongoose.Types.ObjectId() } };
            const res = mockRes();

            const vFind = sinon.stub(Vote, 'findOne').throws(new Error('DB Error'));

            await deleteVote(req, res);

            expect(res.status.calledWith(500)).to.be.true;

            vFind.restore();
        });
    });
});
